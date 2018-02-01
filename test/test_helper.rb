require 'rubygems'
require 'minitest/autorun'
require 'minitest/reporters'
$LOAD_PATH.unshift(File.dirname(__FILE__))

Minitest::Reporters.use!(
Minitest::Reporters::SpecReporter.new,
ENV,
Minitest.backtrace_filter
)

class Minitest::Test

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

  def assert_valid_checksum(tracking_number, info)
    validate_with_checksum(tracking_number, info) do |result, name, serial_number, check_digit|
      assert result, "#{tracking_number} should have matched #{name} checksum algorithm with serial number = #{serial_number} and check digit = #{check_digit}"
    end
  end

  protected

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
end
