require 'rubygems'
require 'minitest/autorun'
require 'minitest/reporters'
$LOAD_PATH.unshift(File.dirname(__FILE__))

Minitest::Reporters.use! [Minitest::Reporters::DefaultReporter.new(:color => true)]

class Minitest::Test

end
