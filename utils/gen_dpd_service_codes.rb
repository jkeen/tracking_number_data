require 'json'

path = File.expand_path(File.join(__dir__, 'dpd-service-codes.txt'))

file = File.read(path)

processed = file.lines.collect do |line|
  items = line.split(' ')
  data = {}

  data[:code] = items.shift
  data[:service] = items.shift
  data[:description] = items.shift

  data
end


puts JSON.generate(processed)