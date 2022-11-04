require 'rubygems'
require 'bundler'
require 'rake'

task :default => :spec

task :spec do
  system 'rspec spec'
end

task :format do
  system 'utils/lint_json.sh'
end