# frozen_string_literal: true

# Copyright (c) [2022] SUSE LLC
#
# All Rights Reserved.
#
# This program is free software; you can redistribute it and/or modify it
# under the terms of version 2 of the GNU General Public License as published
# by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
# more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, contact SUSE LLC.
#
# To contact SUSE LLC about this file by physical or electronic mail, you may
# find current contact information at www.suse.com.

require_relative "../test_helper"
require "agama/cmdline_args"

describe Agama::CmdlineArgs do
  let(:workdir) { File.join(FIXTURES_PATH, "root_dir") }
  subject { described_class.new(workdir: workdir) }

  describe ".read_from" do
    it "reads the kernel command line options and return a CmdlineArgs object" do
      args = described_class.read_from(File.join(workdir, "/proc/cmdline"))
      expect(args.data).to eql("web" => { "ssl" => true })
      expect(args.config_url).to eql("http://example.org/agama.yaml")
    end
  end
end
