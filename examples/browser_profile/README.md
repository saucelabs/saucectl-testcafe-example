# saucectl TestCafe & browser profiles example

If you ever have the need to mock video streams, such as a webcam, the browser
needs to be configured accordingly. Firefox does not provide a browser arg to
enable all flags necessary—they have to be set via the profile settings.

This example illustrates how you can configure saucectl to make use of an
existing preconfigured browser profile.

## What You'll Need

The steps below illustrate one of the quickest ways to get set up. If you'd like
a more in-depth guide, please check out our [documentation](https://docs.saucelabs.com/dev/cli/saucectl/#installing-saucectl).

### Install `saucectl`

```sh
npm install -g saucectl
```

### Set Your Sauce Labs Credentials

```sh
saucectl configure
```

## Running The Examples

Simply check out this repo, navigate into `examples/browser_profile` and run the
command below :rocket:

```sh
saucectl run
```

## The Config

[Follow me](.sauce/config.yml) if you'd like to see how saucectl is configured
for this example.
