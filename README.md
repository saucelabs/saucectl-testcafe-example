# saucectl testcafe example

Example running saucectl with testcafe.

## What You'll Need

The steps below illustrate one of the quickest ways to get set up. If you'd like a more in-depth guide, please check out
our [documentation](https://docs.saucelabs.com/testrunner-toolkit/installation).

### Install `saucectl`

```shell
npm install -g saucectl
```

### Set Your Sauce Labs Credentials

```shell
saucectl configure
```

## Running The Examples

Simply check out this repo and run the command below :rocket:

3 test suites are being triggered in `docker` and `sauce` mode. `saucectl` will run the suites marked as `docker` mode firstly and then run the suites which are marked as `sauce` mode.

```shell
saucectl run -c .sauce/config.yml
```

![docker example](assets/docker_example.gif)

### In Sauce Cloud

```shell
saucectl run -c .sauce/config.yml
```

![sauce cloud example](assets/sauce_cloud_example.gif)

### In Sauce Cloud with iOS Simulators
# TODO (change gif file to ios + sauce mode)

```shell
saucectl run -c .sauce/config_ios.yml
```

![running example](assets/testcafe-example.gif)

## The Config

[Follow me](.sauce/config.yml) if you'd like to see how saucectl is configured for this repository. 
