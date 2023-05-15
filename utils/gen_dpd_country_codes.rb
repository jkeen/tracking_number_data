require 'json'

path = File.expand_path(File.join(__dir__, 'dpd-country-codes.txt'))

file = File.read(path)

processed = file.lines.collect do |line|
  items = line.split(' ')
  data = {}

  data[:code] = items.pop
  data[:country_code] = items.pop
  data[:country_short_code] = items.pop
  data[:country] = items.join(' ')

  data
end


puts JSON.generate(processed)