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

Simply check out this repo and run the appropriate command below :rocket:

### In Docker

```shell
saucectl run -c .sauce/config_docker.yml
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

![sauce cloud example](assets/sauce_cloud_example.gif)

## The Config

[Follow me](.sauce/config.yml) if you'd like to see how saucectl is configured for this repository. 
