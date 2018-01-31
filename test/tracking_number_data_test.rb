require 'test_helper'
require 'active_support'
require 'json'
require 'active_support/core_ext/hash'
require 'active_support/core_ext/string'
require 'shoulda'

def courier_files
  Dir.glob(File.join(File.dirname(__FILE__), "../couriers/*.json"))
end

class TrackingNumberDataTest < Minitest::Test
  courier_files.each do |file|
    file_name = file.split('/').last
    should "read #{file_name} as valid and parseable json" do
      json = JSON.parse(File.read(file)).deep_symbolize_keys!
      assert json
    end
  end
end
