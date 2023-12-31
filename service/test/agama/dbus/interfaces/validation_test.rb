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

require_relative "../../../test_helper"
require "dbus"
require "agama/dbus/interfaces/validation"
require "agama/dbus/base_object"
require "agama/validation_error"

class DBusObjectWithValidationInterface < Agama::DBus::BaseObject
  include Agama::DBus::Interfaces::Validation
  attr_reader :backend

  def initialize(backend)
    super("org.opensuse.Agama.UnitTests")
    @backend = backend
  end
end

describe Agama::DBus::Interfaces::Validation do
  subject { DBusObjectWithValidationInterface.new(backend) }

  let(:backend) { double("Backend", validate: errors) }
  let(:errors) { [] }
  let(:error1) { Agama::ValidationError.new("Some error") }

  describe "#errors" do
    context "when there are not validation errors" do
      it "returns an empty array" do
        expect(subject.errors).to eq([])
      end
    end

    context "when any error exists" do
      let(:errors) { [error1] }

      it "returns the error messages" do
        expect(subject.errors).to eq(["Some error"])
      end
    end
  end

  describe "#valid?" do
    context "when there are not validation errors" do
      it "returns true" do
        expect(subject.valid?).to eq(true)
      end
    end

    context "when any error exists" do
      let(:errors) { [error1] }

      it "returns the error messages" do
        expect(subject.errors).to eq(["Some error"])
      end

      it "returns true" do
        expect(subject.valid?).to eq(false)
      end
    end
  end

  describe "#update_validation" do
    let(:error2) { Agama::ValidationError.new("Another error") }

    before do
      allow(backend).to receive(:validate).and_return([error1], [error1, error2])
    end

    it "updates the validation" do
      expect(subject).to receive(:dbus_properties_changed)
        .once.with("org.opensuse.Agama1.Validation", Hash, [])
      expect { subject.update_validation }
        .to change { subject.errors.size }
        .from(1).to(2)
    end
  end
end
