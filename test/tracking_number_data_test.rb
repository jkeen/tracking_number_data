require 'test_helper'
require 'active_support'
require 'json'
require 'active_support/core_ext/hash'
require 'active_support/core_ext/string'

def courier_files
  Dir.glob(File.join(File.dirname(__FILE__), "../couriers/*.json"))
end

def parsed_json_file(file)
  JSON.parse(File.read(file)).deep_symbolize_keys!
end

class TrackingNumberDataTest < Minitest::Test
  extend Minitest::Spec::DSL

  courier_files.each do |file|
    file_name = file.split('/').last
    describe file_name do
      subject { file }

      it "has a file name without spaces" do
        assert_match /[a-z0-9]/, file_name
      end

      it "should read as valid and parseable json" do
        assert parsed_json_file(file)
      end

      describe "courier details" do
        subject { parsed_json_file(file) }

        it "should have a human readable name" do
          refute_match /\_/, subject[:name], "should not have underscores"
        end

        it "should have a valid courier_code" do
          refute_match /\s/, subject[:courier_code], "should not have spaces"
          assert_match /^([a-z])([a-z][0-9])*/, subject[:courier_code], "should start with a lowercase letter and only contain lowercase letters and numbers"
          assert subject[:courier_code].size > 0, "courier code should not be empty"
        end
      end

      parsed_json_file(file)[:tracking_numbers].each do |info|
        describe info[:name] do
          subject { info }

          let(:pattern) { [subject[:regex]].flatten.join("") }

          it "includes a validation block, even if empty" do
            assert subject.keys.include?(:validation)
          end

          it "includes a regex key as a string or an array of strings" do
            assert subject[:regex]
            assert subject[:regex].is_a?(String) || subject[:regex].is_a?(Array), "Regex must either be a string, or an array of strings"
            if subject[:regex].is_a?(Array)
              assert subject[:regex].all? { |r| r.is_a? String }
            end
          end

          it "has a pattern that compiles as regex" do
            assert Regexp.new(pattern)
          end

          it "has a pattern that can match spaces are double backslashed" do
            assert_match /\\s\*/, pattern
          end

          it "includes a <SerialNumber> character group" do
            assert pattern.include?("?<SerialNumber>")
          end

          it "if it includes a <CheckDigit> group, then validation is specified" do
            if pattern.include?("?<CheckDigit>")
              assert info[:validation][:checksum][:name]
            end
          end

          it "only includes character groups with agreed upon keys" do
            regex = Regexp.new(pattern)

            valid_keys = ["SerialNumber", "CheckDigit", "ServiceType", "CountryCode", "DestinationZip", "PackageId", "ShipperId", "SSID", "ShippingContainerType", "ApplicationIdentifier", "RoutingApplicationId", "SCNC", "GSN", "RoutingNumber"]

            regex.names.each do |name|
              assert valid_keys.include?(name), "#{name} is not recognized as a known character group. Try to use as few keys as possible globally"
            end
          end

          it "if checksum is provided, it is never empty" do
            assert (subject[:validation][:checksum].nil? || subject[:validation][:checksum][:name])
          end

          it "includes valid test numbers" do
            uniques = subject[:test_numbers][:valid].uniq.size
            assert uniques > 1, "must include more unique valid test numbers, only found #{uniques}"
          end

          it "includes invalid test numbers" do
            uniques = subject[:test_numbers][:invalid].uniq.size
            assert uniques > 0, "must include invalid test numbers, found none"
          end

          it "matches included valid numbers with pattern" do
            regex = Regexp.new(pattern)

            subject[:test_numbers][:valid].each do |valid|
              assert regex.match(valid), "#{valid} did not match provided pattern"
            end
          end

          it "matches included valid numbers with specified checksum algorithm" do
            regex = Regexp.new(pattern)

            subject[:test_numbers][:valid].each do |valid|
              if checksum_info = subject[:validation][:checksum]
                assert_valid_checksum(valid, info)
              end
            end
          end

          it "does not validate invalid numbers" do
            regex = Regexp.new(pattern)

            subject[:test_numbers][:invalid].each do |invalid|
              passes_pattern_test = regex.match(invalid)
              has_checksum         = subject[:validation][:checksum]
              has_additional_check = info[:validation][:additional]
              #TODO: implement an actual additional check

              results = []
              results << passes_pattern_test
              results << validate_with_checksum(invalid, info) if has_checksum && passes_pattern_test
              results << false if has_additional_check

              assert(!results.all? {|r| r }, "#{invalid} should not have passed validation checks")
            end
          end

          it "should include valid additional section" do
            if info.keys.include?(:additional)
              assert info[:additional].is_a?(Array), "Additional should be an array"
            end
          end

          it "should have an included regex group in each additional section" do
            if info.keys.include?(:additional)
              info[:additional].each do |section|
                regex = Regexp.new(pattern)
                assert regex.names.include?(section[:regex_group_name]), "'#{section[:regex_group_name]}' not found in match groups #{regex.names}"
              end
            end
          end

          it "should have `matches` or `matches_regex` key in each lookup value" do
            if info.keys.include?(:additional)
              info[:additional].each do |section|
                section[:lookup].each do |lookup|
                    assert (lookup[:matches] || lookup[:matches_regex]), "could not find `matches` or `matches_regex` within #{lookup}"
                end
              end
            end
          end
        end
      end
    end
  end
end
