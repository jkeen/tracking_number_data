# frozen_string_literal: true

require 'bundler/setup'
Bundler.setup

require 'byebug'
require 'tracking_number' # and any other gems you need

RSpec.configure do |config|
  config.example_status_persistence_file_path = '.rspec_status'
end

def validate_with_checksum(tracking_number, info)
  pattern = [info[:regex]].flatten.join("")
  regex = Regexp.new(pattern)

  match = regex.match(tracking_number)

  raw_serial_number = match["SerialNumber"].gsub(/\s/, '')
  check_digit = match["CheckDigit"].gsub(/\s/, '')
  checksum_info = info[:validation][:checksum]

  serial_number = format_serial_number(raw_serial_number, info[:validation][:serial_number_format])

  result = self.send("validates_#{checksum_info[:name]}?", serial_number, check_digit, checksum_info)

  if block_given?
    yield result, checksum_info[:name], serial_number, check_digit
  else
    result
  end
end

def expect_valid_checksum(tracking_number, info)
  validate_with_checksum(tracking_number, info) do |result, name, serial_number, check_digit|
    expect(result).to be_truthy, "#{tracking_number} should have matched #{name} checksum algorithm with serial number = #{serial_number} and check digit = #{check_digit}"
  end
end

def format_serial_number(raw_serial, format_info)
  if format_info
    if format_info[:prepend_if] && raw_serial.match(Regexp.new(format_info[:prepend_if][:matches_regex]))
      return "#{format_info[:prepend_if][:content]}#{raw_serial}"
    elsif format_info[:prepend_if_missing]

    end
  end

  return raw_serial
end

def validates_s10?(sequence, check_digit, extras = {})
  weighting = [8,6,4,2,3,5,9,7]

  total = 0
  sequence.chars.to_a.zip(weighting).each do |(a,b)|
    total += a.to_i * b.to_i
  end

  remainder = total % 11
  check = case remainder
  when 1
    0
  when 0
    5
  else
    11 - remainder
  end

  return check.to_i == check_digit.to_i
end

def validates_sum_product_with_weightings_and_modulo?(sequence, check_digit, extras = {})
  weighting = extras[:weightings] || []

  total = 0
  sequence.chars.to_a.zip(weighting).each do |(a,b)|
    total += a.to_i * b
  end
  return (total % extras[:modulo1] % extras[:modulo2]) == check_digit.to_i
end

def validates_mod10?(sequence, check_digit, extras = {})
  total = 0
  sequence.chars.each_with_index do |c, i|
    x = if c[/[0-9]/] # numeric
      c.to_i
    else
      (c[0].ord - 3) % 10
    end

    if extras[:odds_multiplier] && i.odd?
      x *= extras[:odds_multiplier].to_i
    elsif extras[:evens_multiplier] && i.even?
      x *= extras[:evens_multiplier].to_i
    end

    total += x
  end

  check = (total % 10)
  check = (10 - check) unless (check.zero?)

  return (check.to_i == check_digit.to_i)
end

def validates_mod7?(sequence, check_digit, extras = {})
  # standard mod 7 check
  return true if sequence.to_i % 7 == check_digit.to_i
end

# Helpers for testing integration with tracking_number ruby gem, as a way to actually test the algorithms out

def possible_numbers(tracking)
  tracking = tracking.to_s
  possible_numbers = []
  possible_numbers << tracking
  possible_numbers << tracking.to_s.gsub(" ", "")
  possible_numbers << tracking.chars.to_a.join(" ")
  possible_numbers << tracking.chars.to_a.join("  ")
  possible_numbers << tracking.slice(0, (tracking.length / 2)) + "  " + tracking.slice((tracking.length / 2), tracking.length)

  possible_numbers.flatten.uniq
end

def possible_strings(tracking)
  possible_numbers(tracking).flatten.collect { |t| search_string(t) }
end

def search_string(number)
  %Q{Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor #{number} ut labore et dolore magna aliqua.}
end

def should_detect_number_variants(valid_number, klass, info)
  possible_strings(valid_number).each do |string|
    results = klass.search(string)
    expect(results.size).to eq(1), "could not find #{klass} #{valid_number} in #{string} using search regex: #{info[:regex]}"
  end
end

def should_be_valid_number(valid_number, type, carrier)
  t = TrackingNumber.new(valid_number)
  expect(t.class).to eq(type)
  expect(t.carrier).to eq(carrier)
end

def should_be_invalid_number(invalid_number, type, carrier)
  t = TrackingNumber.new(invalid_number)
  expect(t.valid?).to be_truthy
end

def should_fail_on_check_digit_changes(valid_number)
  digits = valid_number.gsub(/\s/, "").chars.to_a
  last = digits.pop.to_i
  digits << (last  < 2 ? last + 3 : last - 3).to_s
  invalid_number = digits.join
  t = TrackingNumber.new(invalid_number)
  expect(t.valid?).to be_falsy, "#{invalid_number} reported as a valid #{t.class}, and it shouldn't be"
end