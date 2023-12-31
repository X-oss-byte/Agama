# frozen_string_literal: true

require "benchmark"

$LOAD_PATH << File.expand_path("lib", __dir__)

require "agama/dbus/clients/software"

PACKAGES = ["autologin-support", "kdm", "gdm", "sddm", "lightdm"].freeze

CLIENT = Agama::DBus::Clients::Software.new
# warm up call
CLIENT.provisions_selected?(PACKAGES)

RUNS = 100

Benchmark.bm(15) do |x|
  x.report("ask multi:") { RUNS.times { PACKAGES.each { |p| CLIENT.provision_selected?(p) } } }
  x.report("single call:") { RUNS.times { CLIENT.provisions_selected?(PACKAGES) } }
end
