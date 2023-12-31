# Agama Command Line and D-Bus Interface

This project aims to build a command-line interface for
[Agama](https://github.com/yast/agama), a service-based Linux installer featuring a nice
web interface. The second aim is D-Bus service that does not depend heavily on YaST to
reduce memory consumption and also provide better performance.

## Code organization

We have set up [Cargo workspace](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html) with
three packages:

* [agama-lib](./agama-lib): code that can be reused to access the
  [Agama D-Bus API](https://github.com/yast/agama/blob/master/doc/dbus_api.md) and a
  model for the configuration settings.
* [agama-cli](./agama-cli): code specific to the command line interface.
* [agama-derive](./agama-derive): includes a [procedural
  macro](https://doc.rust-lang.org/reference/procedural-macros.html) to reduce the boilerplate code.
* [agama-locale-data](./agama-locale-data): specific library to provide data for localization D-Bus
  API
* [agama-dbus-server](./agama-dbus-server): provides D-Bus API for services implemented in rust

## Status

Agama CLI is still a work in progress, although it is already capable of doing a few things:

* Querying and setting the configuration for the users, storage and software services.
* Handling the auto-installation profiles.
* Triggering the *probing* and the *installation* processes.

Agama D-Bus API is also a work in progress, but it is already used by Agama.

## Installation

You can grab the [RPM package](https://build.opensuse.org/package/show/systemsmanagement:Agama:Devel/agama-cli) from
the [systemsmanagement:Agama:Devel](https://build.opensuse.org/project/show/systemsmanagement:Agama:Devel) project.

If you prefer, you can install it from sources with [Cargo](https://doc.rust-lang.org/cargo/):

```
git clone https://github.com/openSUSE/agama
cd rust
cargo install --path .
```

## Running

For D-Bus API just run as root agama-dbus-server binary and it will properly attach to D-Bus.

For CLI take into account that you need to run `agama-cli` as root when you want to query or change
the Agama configuration. Assuming that the Agama D-Bus service is running, the next command
prints the current settings using JSON (hint: you can use `jq` to make result look better):

```
$ sudo agama --format json config show
{"user":{"fullName":"","userName":"","password":"","autologin":false},"software":{"product":""}}
```

To set one or multiple parameters, just use the `config set` command:

```
$ sudo agama config set software.product=Tumbleweed user.fullName="Jane Doe" user.userName="jane.doe" user.password="12345" user.autologin=true
```

The following operation can take some time. Please, make sure to read the *Caveats* section for more
information.

```
$ sudo agama config show
{"user":{"fullName":"Jane Doe","userName":"jane.doe","password":"","autologin":true},"software":{"product":"Tumbleweed"}}
```

If, at some point you want to force a new probing, you can ask Agama to repeat the process again:

```
$ sudo agama probe
```

It is possible to handle auto-installation profiles too:

```
$ agama profile download http://192.168.122.1/profile.jsonnet
$ agama profile evaluate profile.jsonnet > profile.json
$ agama profile validate profile.json
```

Now that you have a ready to use profile, you can load it into Agama:

```
$ sudo agama config load profile.json
```

## Building and running

You can build and run the project using the `cargo` command:

```
cargo build
sudo ./target/debug/agama --help
```

## A Testing Backend

The previous section assumes that the Agama D-Bus services are running
on the same machine.

For an alternative setup using a containerized backend, see
*[How to set up a backend for testing this
frontend](./agama-cli/doc/backend-for-testing.md)*.

## Testing OBS Build

To test if cargo packages build in OBS push your changes to remote branch. Then do osc checkout of Agama:Staging.
Modify `_service` file and point it to your branch in `<param name="revision">`. Run `osc service manualrun obs_scm` and
then try `osc build` to build it. If it failed push fixes to your branch and repeat service and build step.

## Caveats

* If no product is selected, the `probe` command fails.

[c_a_bug]: https://github.com/openSUSE/obs-service-cargo_audit/pull/6
