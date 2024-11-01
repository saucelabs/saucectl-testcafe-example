# saucectl TestCafe & React Example

This example demonstrates how to use a test time dependency when running your
TestCafe tests with saucectl.

## What You'll Need

The steps below illustrate one of the quickest ways to get set up. If you'd like
a more in-depth guide, please check out our 
[documentation](https://docs.saucelabs.com/dev/cli/saucectl/#installing-saucectl).

### Install `saucectl`

```sh
npm install -g saucectl
```

### Set Your Sauce Labs Credentials

```sh
saucectl configure
```

## Running The Examples

Simply check out this repo, navigate into `examples/react` and run the
command below :rocket:

```sh
saucectl run
```

## Configuration

The test in this example requires the
[testcafe-react-selectors](https://github.com/DevExpress/testcafe-react-selectors)
package so it needs to be available in the test environment. We can define a
list of packages to install before test execution in the saucectl configuration
file.

```yaml
npm:
  usePackageLock: true
  packages:
    "testcafe-react-selectors": "^5.0.3"
```

Enabling the `usePackageLock` option ensures that the project's package.json and
package-lock.json are used during package installation. In most cases, this will
reduce the time needed for package installation.
