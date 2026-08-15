tracking_number_data changelog

# [2.0.0](https://github.com/jkeen/tracking_number_data/compare/v1.13.0...v2.0.0) (2026-08-15)


* feat!: rebuild the IMpb USPS definitions from Publication 199 and remove the similar DHL and Fedex definitions that were not always correct ([cd25fe2](https://github.com/jkeen/tracking_number_data/commit/cd25fe27af3f090da2afeb13a26abfeb563b3359))


### BREAKING CHANGES

* `fedex_smartpost`, `dhl_ecommerce_30` and `usps_32V2` are absorbed into `usps_impb_c`, which is the definition they were always describing. `usps_91` and `usps_22` become `usps_impb_c` and `usps_impb_n`, and Application Identifier 91 splits off to `usps_legacy`. Every number these matched still decodes, now as USPS.

No active definitions declare `partners` anymore, but it remains valid in our spec for potential future use.

# [1.13.0](https://github.com/jkeen/tracking_number_data/compare/v1.12.0...v1.13.0) (2026-08-15)


### Features

* Add FedEx ASTRA detection ([5b14885](https://github.com/jkeen/tracking_number_data/commit/5b1488509449475464a062d3c553350ae7807771)), closes [#24](https://github.com/jkeen/tracking_number_data/issues/24)
* Add Yodel tracking number detection ([15fabeb](https://github.com/jkeen/tracking_number_data/commit/15fabeb985bbae6f0f69b67425ca663048cd9216)), closes [#91](https://github.com/jkeen/tracking_number_data/issues/91)

# [1.12.0](https://github.com/jkeen/tracking_number_data/compare/v1.11.1...v1.12.0) (2026-08-13)


### Bug Fixes

* loosen FedEx express pattern to match new number formats ([#117](https://github.com/jkeen/tracking_number_data/issues/117)) ([9d19f67](https://github.com/jkeen/tracking_number_data/commit/9d19f67bd51e261ea7d416504df02a1721e5dbab))


### Features

* add Canpar, Purolator, and Spee-Dee courier definitions ([#116](https://github.com/jkeen/tracking_number_data/issues/116)) ([fd1f916](https://github.com/jkeen/tracking_number_data/commit/fd1f9165aad956d094ec526677ce2303235389ad))
* Add support for GOFO Express (US). ([#110](https://github.com/jkeen/tracking_number_data/issues/110)) ([5912b86](https://github.com/jkeen/tracking_number_data/commit/5912b862129c1091860197e65591aa3ed5b28167))
* Add support for the LaserShip 1LSCX format. ([#107](https://github.com/jkeen/tracking_number_data/issues/107)) ([4d3311d](https://github.com/jkeen/tracking_number_data/commit/4d3311dee8dfcf4dda35a23c84ad2f85723107b3))
* Added support for YunExpress tracking numbers. ([#109](https://github.com/jkeen/tracking_number_data/issues/109)) ([dd52b7f](https://github.com/jkeen/tracking_number_data/commit/dd52b7fbfdbe0e2da955bde61127c93c6d766cb7))

## [1.11.1](https://github.com/jkeen/tracking_number_data/compare/v1.11.0...v1.11.1) (2026-08-13)

# [1.11.0](https://github.com/jkeen/tracking_number_data/compare/v1.10.0...v1.11.0) (2026-08-13)


### Features

* every definition states the constants its checksum runs on ([336ce00](https://github.com/jkeen/tracking_number_data/commit/336ce0085064bbf8eac412c6614fd40d58f4d7f6))

# [1.10.0](https://github.com/jkeen/tracking_number_data/compare/v1.9.0...v1.10.0) (2026-08-13)


### Features

* add glossary to define common terms that tracking number implementations can use for display ([66a82e7](https://github.com/jkeen/tracking_number_data/commit/66a82e7269252834a054c83a5aeec4204316fcb1))

# [1.9.0](https://github.com/jkeen/tracking_number_data/compare/v1.8.1...v1.9.0) (2025-08-21)


### Features

* Add support for USPS 22 digit numbers, and 30 digit DHL E-commerce numbers. Tighten up some definitions to avoid collisions, and to correctly model shared-delivery partnerships correctly ([30eace7](https://github.com/jkeen/tracking_number_data/commit/30eace7a459aed1ea6f23de87a1d739103383ff6))

## [1.8.1](https://github.com/jkeen/tracking_number_data/compare/v1.8.0...v1.8.1) (2025-06-24)


### Bug Fixes

* tighten up DHL ecommerce change to not match a random string of letters ([64d6b99](https://github.com/jkeen/tracking_number_data/commit/64d6b99279a7c52006ae35bbec940b9697c75ab4))

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
