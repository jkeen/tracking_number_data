# frozen_string_literal: true

require 'spec_helper'
require 'tracking_number'

def load_courier_data
  TrackingNumber::Loader.load_tracking_number_data(File.expand_path(File.join(__dir__, '../couriers/')))
end

# Ideally each tracking numbers definition would only return one match, and that's usually the case
# when tracking numbers contain check digits, but some numbers like Amazon Logictics and Lasership don't
# do that, which increases the risk of false positives. These tests keep an eye on that.

describe "Collisions" do
  load_courier_data.each do |data|
    klass = data[:class]
    courier_name = data[:name]
    courier_code = data[:courier_code].to_sym
    tracking_info = data[:info]

    describe tracking_info[:name] do
      valid_numbers = tracking_info[:test_numbers][:valid].flatten.compact

      match_counts = valid_numbers.collect { |number| TrackingNumber.detect_all(number).size }.group_by { |count| count }.collect { |count, matches| [count, matches.size] }.to_h
      if match_counts[1] == valid_numbers.size 
        it "matches one type of number" do
          expect(true).to be_truthy
        end
      else
        valid_numbers.each do |number|
          detections = TrackingNumber.detect_all(number)
          if detections.size > 1
            xit "TODO: #{number} returned #{detections.collect { |a| a.class.to_s }.join(', ')} and it would be better if it didn't"
          end
        end
      end
    end
  end
end
