# frozen_string_literal: true

require 'spec_helper'
require 'active_support'
require 'json'
require 'active_support/core_ext/hash'
require 'active_support/core_ext/string'

def courier_files
  Dir.glob(File.expand_path(File.join(__dir__, '../couriers/*.json')))
end

def parsed_json_file(file)
  JSON.parse(File.read(file)).deep_symbolize_keys!
end

def tracking_data
  @tracking_data ||= begin
    data = {}
    courier_files.each do |file|
      file_name = file.split('/').last
      json = parsed_json_file(file)

      json[:tracking_numbers].each do |info|
        data[info[:id]] = info
      end
    end

    data
  end
end

courier_files.each do |file|
  file_name = file.split('/').last
  data = parsed_json_file(file)

  describe file_name do
    subject { file }

    it 'has a file name without spaces' do
      expect(file_name).to(match(/[a-z0-9]+\.json/))
    end

    it 'reads as valid and parseable json' do
      expect(data).to(be_truthy)
    end

    it 'has a human readable name' do
      expect(data[:name]).to_not match(/_/), 'should not have underscores'
    end

    it 'has a valid courier_code' do
      expect(data[:courier_code]).to_not match(/\s/), 'should not have underscores'
      expect(data[:courier_code]).to match(/^([a-z])([a-z][0-9])*/)
      expect(!data[:courier_code].empty?).to(be_truthy)
    end
  end

  data[:tracking_numbers].each do |info|
    context info[:name] do
      subject { info }

      let(:pattern) { [subject[:regex]].flatten.join('') }

      it 'includes a validation block, even if empty' do
        expect(subject.keys.include?(:validation)).to(eq(true))
      end

      it 'includes a regex key as a string or an array of strings' do
        expect(subject[:regex]).to(be_truthy)
        expect((subject[:regex].is_a?(String) or subject[:regex].is_a?(Array))).to(be_truthy)
        expect(subject[:regex].all? { |r| r.is_a?(String) }).to(be_truthy) if subject[:regex].is_a?(Array)
      end

      it 'has a pattern that compiles as regex' do
        expect(Regexp.new(pattern)).to(be_truthy)
      end

      it 'has a pattern that can match spaces are double backslashed' do
        expect(pattern).to(match(/\\s\*/))
      end

      it 'includes a <SerialNumber> character group' do
        expect(pattern.include?('?<SerialNumber>')).to(eq(true))
      end

      it 'specifies validiation if a <CheckDigit> group is present' do
        expect(info[:validation][:checksum][:name]).to(be_truthy) if pattern.include?('?<CheckDigit>')
      end

      it 'only includes character groups with agreed upon keys' do
        regex = Regexp.new(pattern)
        valid_keys = %w[SerialNumber CheckDigit ServiceType CountryCode DestinationZip PackageId
                        ShipperId SSID ShippingContainerType ApplicationIdentifier RoutingApplicationId SCNC GSN RoutingNumber OriginId]
        regex.names.each { |name| expect(valid_keys.include?(name)).to(eq(true)) }
      end

      it 'if checksum is provided, it is never empty' do
        expect((subject[:validation][:checksum].nil? or subject[:validation][:checksum][:name])).to(be_truthy)
      end

      it 'includes valid test numbers' do
        uniques = subject[:test_numbers][:valid].uniq.size
        expect((uniques > 1)).to(be_truthy)
      end

      it 'includes invalid test numbers' do
        uniques = subject[:test_numbers][:invalid].uniq.size
        expect((uniques > 0)).to(be_truthy)
      end

      it 'matches included valid numbers with pattern' do
        regex = Regexp.new(pattern)
        subject[:test_numbers][:valid].each do |valid|
          expect(regex.match(valid)).to(be_truthy)
        end
      end

      it 'matches included valid numbers with specified checksum algorithm' do
        subject[:test_numbers][:valid].each do |valid|
          if checksum_info = subject[:validation][:checksum]
            expect_valid_checksum(valid, info)
          end
        end
      end

      it 'does not validate invalid numbers' do
        regex = Regexp.new(pattern)
        subject[:test_numbers][:invalid].each do |invalid|
          passes_pattern_test = regex.match(invalid)
          has_checksum = subject[:validation][:checksum]
          has_additional_check = info[:validation][:additional]
          results = []
          (results << passes_pattern_test)
          if has_checksum && passes_pattern_test
            (results << validate_with_checksum(invalid, info))
          end
          (results << false) if has_additional_check
          expect((!results.all? { |r| r })).to(be_truthy)
        end
      end

      it 'should include valid additional section' do
        expect(info[:additional].is_a?(Array)).to(eq(true)) if info.keys.include?(:additional)
      end

      it 'should have an included regex group in each additional section' do
        if info.keys.include?(:additional)
          info[:additional].each do |section|
            regex = Regexp.new(pattern)
            expect(regex.names.include?(section[:regex_group_name])).to(eq(true))
          end
        end
      end

      it 'should have `matches` or `matches_regex` key in each lookup value' do
        if info.keys.include?(:additional)
          info[:additional].each do |section|
            section[:lookup].each do |lookup|
              expect((lookup[:matches] or lookup[:matches_regex])).to(be_truthy)
            end
          end
        end
      end

      it 'should have a two way reference if the partner block is included' do
        if info.keys.include?(:partners)
          info[:partners].each do |partner|
            expect(partner[:partner_id]).to(be_truthy)
            expect(partner[:partner_type]).to(be_truthy)

            partner_data = tracking_data[partner[:partner_id]]

            expect(partner_data&.keys&.include?(:partners)).to(eq(true))
            expect(partner_data[:partners]&.map { |p| p[:partner_id] }).to(include(info[:id]))
          end
        end
      end
    end
  end
end

