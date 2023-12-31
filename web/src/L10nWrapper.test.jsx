/*
 * Copyright (c) [2023] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of version 2 of the GNU General Public License as published
 * by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import React from "react";
import { render, screen } from "@testing-library/react";

import L10nWrapper from "~/L10nWrapper";

describe("L10nWrapper", () => {
  // remember the original object, we need to temporarily replace it with a mock
  const origLocation = window.location;

  // mock window.location.reload
  beforeAll(() => {
    delete window.location;
    window.location = {
      reload: jest.fn(),
    };
  });

  afterAll(() => {
    window.location = origLocation;
  });

  // remove the Cockpit language cookie after each test
  afterEach(() => {
    // setting a cookie with already expired date removes it
    document.cookie = "CockpitLang=; path=/; expires=" + new Date(0).toUTCString();
  });

  describe("when no URL query parameter is set", () => {
    beforeEach(() => {
      window.location.search = "";
    });

    describe("when the Cockpit language is already set", () => {
      beforeEach(() => {
        document.cookie = "CockpitLang=en-us; path=/;";
      });

      it("displays the children content and does not reload", async () => {
        render(<L10nWrapper>Testing content</L10nWrapper>);

        // children are displayed
        await screen.findByText("Testing content");

        expect(window.location.reload).not.toHaveBeenCalled();
      });
    });

    describe("when the Cockpit language is not set", () => {
      // so far this is only done in "test" and "development" environments,
      // not in "production"!!
      it("sets the preferred language from browser and reloads", () => {
        render(<L10nWrapper>Testing content</L10nWrapper>);

        // jsdom uses "en-US" as the user preferred language
        expect(document.cookie).toEqual("CockpitLang=en-us");
        expect(window.location.reload).toHaveBeenCalled();
      });
    });
  });

  describe("when the URL query parameter is set to '?lang=cs_CZ'", () => {
    beforeEach(() => {
      window.location.search = "?lang=cs_CZ";
    });

    describe("when the Cockpit language is already set to 'cs-cz'", () => {
      beforeEach(() => {
        document.cookie = "CockpitLang=cs-cz; path=/;";
      });

      it("displays the children content and does not reload", async () => {
        render(<L10nWrapper>Testing content</L10nWrapper>);

        // children are displayed
        await screen.findByText("Testing content");

        expect(document.cookie).toEqual("CockpitLang=cs-cz");
        expect(window.location.reload).not.toHaveBeenCalled();
      });
    });

    describe("when the Cockpit language is set to 'en-us'", () => {
      beforeEach(() => {
        document.cookie = "CockpitLang=en-us; path=/;";
      });

      it("sets the 'cs-cz' language and reloads", () => {
        render(<L10nWrapper>Testing content</L10nWrapper>);

        expect(document.cookie).toEqual("CockpitLang=cs-cz");
        expect(window.location.reload).toHaveBeenCalled();
      });
    });

    describe("when the Cockpit language is not set", () => {
      it("sets the 'cs-cz' language and reloads", () => {
        render(<L10nWrapper>Testing content</L10nWrapper>);

        // jsdom uses "en-US" as the user preferred language
        expect(document.cookie).toEqual("CockpitLang=cs-cz");
        expect(window.location.reload).toHaveBeenCalled();
      });
    });
  });
});
