# frozen_string_literal: true

require 'spec_helper'
require 'tracking_number'

def load_courier_data
  TrackingNumber::Loader.load_tracking_number_data(File.expand_path(File.join(__dir__, '../couriers/')))
end

  load_courier_data.each do |data|
    klass         = data[:class]
    courier_name  = data[:name]
    courier_code  = data[:courier_code].to_sym
    tracking_info = data[:info]
    match_groups  = [tracking_info[:regex]].flatten.join.scan(/<(\w+)>/).flatten

    describe tracking_info[:name] do
      context "valid number" do
        tracking_info[:test_numbers][:valid].each do |valid_number|
          context valid_number do
            subject { valid_number }
            let(:tracking_number) { klass.new(valid_number) }

            it 'is found in search' do
              matches = TrackingNumber.search(subject, match: :all)
              results = matches.collect(&:class).collect(&:to_s)
              expect(results.include?(klass.to_s)).to(eq(true))
            end

            if tracking_info[:validation][:checksum]
              it 'fails on check digit changes' do
                should_fail_on_check_digit_changes(valid_number)
              end
            end

            it 'is found in search regardless of spacing' do
              should_detect_number_variants(valid_number, klass, tracking_info)
            end

            it 'validates' do
              expect(tracking_number.carrier).to(eq(courier_code))
              expect(tracking_number.valid?).to(eq(true))
            end

            it "returns #{courier_code} for #courier_code" do
              tracking_number = klass.new(valid_number)
              expect(tracking_number.courier_code).to(eq(courier_code))
            end

            it "returns correct courier name" do
              if tracking_number.matching_additional['Courier']
                expect(tracking_number.courier_name).to(eq(tracking_number.matching_additional['Courier'][:courier]))
              else
                expect(tracking_number.courier_name).to(eq(courier_name))
              end
            end

            it 'does not error when calling #service_type' do
              service_type = tracking_number.service_type
              expect((service_type.is_a?(String) or service_type.nil?)).to(be_truthy)
            end

            it 'does not error when calling #destination' do
              expect((tracking_number.destination_zip.is_a?(String) or tracking_number.destination_zip.nil?)).to(be_truthy)
            end

            it 'does not error when calling #shipper' do
              expect((tracking_number.shipper_id.is_a?(String) or tracking_number.shipper_id.nil?)).to(be_truthy)
            end

            it 'does not error when calling #package_type' do
              expect((tracking_number.package_type.is_a?(String) or tracking_number.package_type.nil?)).to(be_truthy)
            end

            it 'does not error when calling #decode' do
              decode = tracking_number.decode
              expect(decode.is_a?(Hash)).to(eq(true))
            end
          end
        end
      end

      context "invalid number" do
        tracking_info[:test_numbers][:invalid].each do |invalid_number|
          context invalid_number do
            let(:tracking_number) { klass.new(invalid_number) }

            it "does not validate" do
              t = klass.new(invalid_number)
              expect((!t.valid?)).to(be_truthy)
            end

            it "returns empty hash for #decode" do
              t = klass.new(invalid_number)
              decode = t.decode
              expect(decode.is_a?(Hash)).to(eq(true))
            end
          end
        end
      end
    end
  end
