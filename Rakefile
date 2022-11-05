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

namespace :test do
  task :format do
    system 'rspec spec/format_spec.rb'
  end

  task :implementation do
    system 'rspec spec/implementation_spec.rb'
  end

  task :collisions do
    system 'rspec spec/collision_spec.rb'
  end
end