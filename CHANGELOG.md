tracking_number_data changelog

# [1.8.0](https://github.com/jkeen/tracking_number_data/compare/v1.7.0...v1.8.0) (2025-06-24)


### Bug Fixes

* allow letters in DHL E-Commerce tracking numbers ([#106](https://github.com/jkeen/tracking_number_data/issues/106)) ([872646f](https://github.com/jkeen/tracking_number_data/commit/872646f0a8fb5b5433410c0145c8986f4350cddf))


### Features

* add DHL eCommerce 14-digit format ([#104](https://github.com/jkeen/tracking_number_data/issues/104)) ([8d7ea93](https://github.com/jkeen/tracking_number_data/commit/8d7ea936fb82fb8234ae20dc5e0feb44638fa53d))

# [1.7.0](https://github.com/jkeen/tracking_number_data/compare/v1.6.2...v1.7.0) (2025-04-07)


### Features

* Old Dominion support ([#103](https://github.com/jkeen/tracking_number_data/issues/103)) ([77072ff](https://github.com/jkeen/tracking_number_data/commit/77072ffe6b8a061f5b4ecca8ef03e7c8fb129faf))

## [1.6.2](https://github.com/jkeen/tracking_number_data/compare/v1.6.1...v1.6.2) (2025-04-07)

## [1.6.1](https://github.com/jkeen/tracking_number_data/compare/v1.6.0...v1.6.1) (2023-10-20)


### Bug Fixes

* Correct serial number group for DHL express numbers, split J* numbers into their own group and remove validation, since it appears they have none ([#100](https://github.com/jkeen/tracking_number_data/issues/100)) ([24c6f03](https://github.com/jkeen/tracking_number_data/commit/24c6f035fc2bac46bcd9fcbcd14b87f70bc5db09))

# [1.6.0](https://github.com/jkeen/tracking_number_data/compare/v1.5.1...v1.6.0) (2023-08-14)


### Features

* lock down fedex smart post numbers a little more to prevent invalid usps 91/smart post overlaps ([2cfdfba](https://github.com/jkeen/tracking_number_data/commit/2cfdfba14c0fe551918b68ad8d32695225eb88cb))

## [1.5.1](https://github.com/jkeen/tracking_number_data/compare/v1.5.0...v1.5.1) (2023-08-02)


### Bug Fixes

* update OnTrac tracking URL ([#96](https://github.com/jkeen/tracking_number_data/issues/96)) ([19a5630](https://github.com/jkeen/tracking_number_data/commit/19a5630191d7f0f28b57856b28178f9e8f83aafa))

# [1.5.0](https://github.com/jkeen/tracking_number_data/compare/v1.4.0...v1.5.0) (2023-05-15)


### Features

* Add partners relationship to model shipments that may be shared between carriers. e.g. FedEx SmartPost shipments are delivered by USPS ([4ff4ea9](https://github.com/jkeen/tracking_number_data/commit/4ff4ea98344c625289b287336e2769daa8835685))

# [1.4.0](https://github.com/jkeen/tracking_number_data/compare/v1.3.2...v1.4.0) (2023-05-15)


### Bug Fixes

* Let number definition sort out variable spaces for testing. For the most part numbers are continuous, ([8a5047a](https://github.com/jkeen/tracking_number_data/commit/8a5047a7ac68778e3134480a8ae94f1c6ca8b14e))
* tighten up some detections to prevent overlaps ([6088dd4](https://github.com/jkeen/tracking_number_data/commit/6088dd44b8484499ba9ec0368a1f3c51b68fd405))


### Features

* add ids to definitions for cross referencing ([40ee04e](https://github.com/jkeen/tracking_number_data/commit/40ee04e9d7bbc7673801dd30602ca33ac9433768))
