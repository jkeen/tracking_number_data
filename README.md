[![Tests](https://github.com/jkeen/tracking_number_data/actions/workflows/tests.yml/badge.svg)](https://github.com/jkeen/tracking_number_data/actions/workflows/tests.yml)
[![Release](https://img.shields.io/github/v/release/jkeen/tracking_number_data?sort=semver&label=release)](https://github.com/jkeen/tracking_number_data/releases)
[![Semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue)](https://semver.org/spec/v2.0.0.html)
[![Semantic release](https://img.shields.io/badge/semantic--release-conventional_commits-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

# Tracking Number Data

This repository contains json files that programmatically describe how to detect, validate, and decode tracking numbers. The collection started in the [tracking_number](https://github.com/jkeen/tracking_number) ruby gem in 2010, and split out here in 2017 so that any language could use it.

**[trackingnumber.fyi](https://trackingnumber.fyi)** consumes the latest release of this data. Paste a number in and it will tell you which carrier it belongs to and illustrate, digit by digit, what each part of that number means.

## Libraries built on this data

| Language | Library | |
| --- | --- | --- |
| Ruby | [tracking_number](https://github.com/jkeen/tracking_number) | [![Stars](https://img.shields.io/github/stars/jkeen/tracking_number?label=%20&logo=github)](https://github.com/jkeen/tracking_number/stargazers) |
| JavaScript / TypeScript | [ts-tracking-number](https://github.com/rjbrooksjr/ts-tracking-number) | [![Stars](https://img.shields.io/github/stars/rjbrooksjr/ts-tracking-number?label=%20&logo=github)](https://github.com/rjbrooksjr/ts-tracking-number/stargazers) |
| Python | [tracking-numbers](https://github.com/jcomo/tracking-numbers/) | [![Stars](https://img.shields.io/github/stars/jcomo/tracking-numbers?label=%20&logo=github)](https://github.com/jcomo/tracking-numbers/stargazers) |
| Java | [MysteryTrackingNumber](https://github.com/adgaudio/MysteryTrackingNumber) | [![Stars](https://img.shields.io/github/stars/adgaudio/MysteryTrackingNumber?label=%20&logo=github)](https://github.com/adgaudio/MysteryTrackingNumber/stargazers) |
| Go | [go-package-tracking](https://github.com/Freespoke/go-package-tracking) | [![Stars](https://img.shields.io/github/stars/Freespoke/go-package-tracking?label=%20&logo=github)](https://github.com/Freespoke/go-package-tracking/stargazers) |
| Rust | [rs-tracking-numbers](https://github.com/richid/rs-tracking-numbers) | [![Stars](https://img.shields.io/github/stars/richid/rs-tracking-numbers?label=%20&logo=github)](https://github.com/richid/rs-tracking-numbers/stargazers) |

Written one for a language that isn't listed? Open a PR to get it added to this list.

## Supported carriers

<!-- generated: supported tracking numbers -->

| Carrier | Formats |
| --- | --- |
| Amazon | [Amazon Logistics](https://trackingnumber.fyi/format/amazon/amazon_logistics) · [Amazon International](https://trackingnumber.fyi/format/amazon/amazon_international) |
| Canada Post | [Canada Post (16)](https://trackingnumber.fyi/format/canada_post/canada_post) |
| Canpar | [Canpar (22)](https://trackingnumber.fyi/format/canpar/canpar_22) |
| DHL | [DHL Express](https://trackingnumber.fyi/format/dhl/dhl_express) · [DHL Express (Piece ID)](https://trackingnumber.fyi/format/dhl/dhl_express_piece_id) · [DHL E-Commerce](https://trackingnumber.fyi/format/dhl/dhl_ecommerce) · [DHL E-Commerce (14)](https://trackingnumber.fyi/format/dhl/dhl_ecommerce_14) |
| DPD | [DPD (28)](https://trackingnumber.fyi/format/dpd/dpd) · [DPD (14)](https://trackingnumber.fyi/format/dpd/dpd_14) |
| FedEx | [FedEx Express (12)](https://trackingnumber.fyi/format/fedex/fedex_12) · [FedEx Express (34)](https://trackingnumber.fyi/format/fedex/fedex_34) · [FedEx ASTRA (32)](https://trackingnumber.fyi/format/fedex/fedex_astra_32) · [FedEx Ground](https://trackingnumber.fyi/format/fedex/fedex_ground) · [FedEx Ground (SSCC-18)](https://trackingnumber.fyi/format/fedex/fedex_ground_sscc_18) · [FedEx Ground 96 (22)](https://trackingnumber.fyi/format/fedex/fedex_ground_96) · [FedEx Ground GSN](https://trackingnumber.fyi/format/fedex/fedex_ground_gsn) |
| GOFO Express | [GOFO Express (US)](https://trackingnumber.fyi/format/gofo/gofo_us) |
| Landmark Global LTN | [Landmark Global LTN](https://trackingnumber.fyi/format/landmark/landmark_global) |
| LaserShip | [LaserShip LX](https://trackingnumber.fyi/format/lasership/lasership_lx) · [LaserShip 1LS7 (15)](https://trackingnumber.fyi/format/lasership/lasership_1ls7) · [LaserShip 1LS7 (18)](https://trackingnumber.fyi/format/lasership/lasership-1ls7-18) · [LaserShip 1LSCX (15)](https://trackingnumber.fyi/format/lasership/lasership_1lscx) |
| Old Dominion Freight Line | [Old Dominion](https://trackingnumber.fyi/format/old_dominion/old-dominion) · [Old Dominion Guaranteed Shipment](https://trackingnumber.fyi/format/old_dominion/old-dominion-guaranteed-shipment) |
| OnTrac | [OnTrac](https://trackingnumber.fyi/format/ontrac/ontrac_c) · [OnTrac D](https://trackingnumber.fyi/format/ontrac/ontrac_d) |
| Purolator | [Purolator (12)](https://trackingnumber.fyi/format/purolator/purolator_numeric) · [Purolator (alpha + 9)](https://trackingnumber.fyi/format/purolator/purolator_alpha) |
| S10 International Standard | [S10](https://trackingnumber.fyi/format/s10/s10) |
| Spee-Dee Delivery | [Spee-Dee (20)](https://trackingnumber.fyi/format/speedee/speedee) |
| United States Postal Service | [USPS 20](https://trackingnumber.fyi/format/usps/usps_20) · [USPS IMpb N](https://trackingnumber.fyi/format/usps/usps_impb_n) · [USPS Legacy](https://trackingnumber.fyi/format/usps/usps_legacy) · [USPS IMpb C](https://trackingnumber.fyi/format/usps/usps_impb_c) |
| UPS | [UPS](https://trackingnumber.fyi/format/ups/ups) · [UPS Waybill](https://trackingnumber.fyi/format/ups/ups-waybill) |
| Yodel | [Yodel](https://trackingnumber.fyi/format/yodel/yodel) |
| YunExpress | [YunExpress](https://trackingnumber.fyi/format/yunexpress/yunexpress) |

<!-- /generated -->

## JSON Format

### couriers/*.json

Identifies the standard couriers that might send mail. Here is `couriers/s10.json`, shortened:

```json
{
  "name": "S10 International Standard",
  "courier_code": "s10",
  "tracking_numbers": [
    {
      "id": "s10",
      "name": "S10",
      "description": "The UPU format every postal service uses for international items",
      "regex": "\\s*(?<ServiceType>([A-Z]\\s*){2})(?<SerialNumber>([0-9]\\s*){8})(?<CheckDigit>([0-9]\\s*))(?<CountryCode>([A-Z]\\s*){2})",
      "validation": {
        "checksum": { "name": "s10", "weightings": [8, 6, 4, 2, 3, 5, 9, 7], "modulo": 11 }
      },
      "glossary": {
        "SerialNumber": { "description": "Eight digits assigned by the issuing postal service." }
      },
      "tracking_url": null,
      "test_numbers": {
        "valid": ["RB123456785GB", "RB123456785US"],
        "invalid": ["RB123456786US", "RB123456785XX"]
      }
    }
  ]
}
```

#### Courier keys

| Key | What it is |
| --- | --- |
| `name` | Identifies the courier |
| `courier_code` | Short code to identify the courier. Alphanumeric only, no spaces. |
| `tracking_numbers` | An array of possible tracking number formats for this courier |

#### Tracking number keys

| Key | What it is |
| --- | --- |
| `id` | Identifies this format no matter what it gets renamed to. Both `partner_id` and the format's address on the site point back at this |
| `name` | A name to identify this type of tracking number. Usually includes the carrier in the name, i.e. `FedExGround` |
| `regex` | A pcre compatible regular expression that identifies the tracking number regardless of spaces in-between characters. Either a string, or an array of strings to be concatenated (to help with readability). |
| `description` | (optional) A note about the format itself, such as `"USPS now calls this the IMpb barcode format"` |
| `glossary` | (optional) What this format's named groups mean when the general description isn't specific enough, keyed by group name |
| `validation` | Specifies how the tracking number is validated |
| `additional` | (optional) Further information relating to a named regex group, such as a lookup table for the `ServiceType` group |
| `partners` | (optional) A possible partnership between carriers, where one party is the shipper and the other the last mile carrier |
| `tracking_url` | A url that we can use to find the tracking history for a particular tracking number. It assumes the tracking number can be entered using python style string formatting `"www.courier.com?trackingnumber=%s"` |
| `test_numbers` | `valid`: an array of valid tracking numbers for testing, and `invalid`: an array of invalid tracking numbers for testing |

Every regex must contain the named groups `SerialNumber` and `CheckDigit` and depending on the tracking number can optionally contain the following common attributes:

- `ServiceType`: indicating the type of delivery service
- `ShipperId`: indicating the shipper id
- `PackageId`: indicating the package id
- `DestinationZip`: indicating the destination zip code

##### validation

`checksum`: if the tracking number has a checksum, include a `checksum` key with the details. `name` specifies the algorithm. Supported algorithms are `mod10`, `mod7`, `s10`, `luhn`, `mod_37_36` and `sum_product_with_weightings_and_modulo`.

```json
"validation": {
  "checksum": {
    "name": "mod10",
    "evens_multiplier": 1,
    "odds_multiplier": 2
  }
}
```

Each checksum carries the constants its algorithm uses. Look at existing examples for parameters, or at [CHECKSUM_ALGORITHMS.md](CHECKSUM_ALGORITHMS.md) for how each one works.

`serial_number_format`: some tracking numbers require some modification of the `SerialNumber` group before validation. In the example below, the serial number needs a "91" prepended before validation unless the number starts with a 91, 92, 93, 94, or 95

```json
"serial_number_format": {
  "prepend_if": {
    "matches_regex": "^(?!9[1-5]).+",
    "content": "91"
  }
}
```

`additional`: some tracking numbers are only valid if one of their `additional` lookups finds a match. S10 requires a `Courier`, so a country code no postal service uses is invalid even with the right check digit.

```json
"validation": {
  "additional": { "exists": ["Courier"] }
}
```

##### additional

A lookup table for the `ServiceType` regex group, relating the two digit letter code with the type of service:

```json
"additional": [
  {
    "name": "Service Type",
    "regex_group_name": "ServiceType",
    "lookup": [
      { "matches": "01", "name": "UPS United States Next Day Air (Red)" },
      { "matches": "02", "name": "UPS United States Second Day Air (Blue)" }
    ]
  }
]
```

Each hash in the `lookup` array should contain a key called `matches` or `matches_regex`, specifying how the value of `regex_group_name` should be compared.

##### partners

Each entry describes a possible partnership between carriers, where one party is the _shipper_ and the other the last mile _carrier_. A partnership only holds if both ends pass their checks against the same number. Each item in the partners array should have:

- `partner_id`: (required) reference indicating the related definition
- `partner_type`: (required) the relationship, either `shipper` or `carrier`
- `description`: (optional) mainly for humans reading this
- `validation`: (optional) a validation block deciding whether this partnership applies, either `matches_all` or `matches_any`, an array of match conditions each with a `regex_group_name` and either a `matches` or a `matches_regex`

### glossary.json

What each part means, keyed by the regex group name. Anything reading `couriers/*.json` can then describe a `SerialNumber` the same way everything else does.

```json
"ServiceType": {
  "label": "Service Type",
  "description": "A code for the delivery service used."
}
```

A definition's own `glossary` overrides the description when it can be more specific. For `s10`, the service type is two letters and the serial is eight digits assigned by the issuing postal service.

```json
"glossary": {
  "ServiceType": {
    "description": "Two letters for the class of postal service, the first of which identifies the service and the second the variant."
  },
  "SerialNumber": {
    "description": "Eight digits assigned by the issuing postal service."
  }
}
```

## Making a contribution

### I'm adding or fixing a definition
- Open an issue and specify the tracking numbers and courier service.
- Modify or add definitions in the couriers/*.json files. Take a look at the existing ones, and follow the guidance above. Use https://trackingnumber.fyi for guidance on check digit algorithms if needed.
- Run `./utils/lint_json.sh` to clean up and validate the json file (you may need jq or other dependencies).
- Run the tests locally. `bundle exec rake` If they pass, it's good, submit a PR!

The supported carriers table above is generated by CI and will update after a PR has been merged.

## Reference

- Standard implementations of [check digit algorithms](https://github.com/jkeen/tracking_number/blob/main/lib/tracking_number/checksum_validations.rb) and [serial number parsing](https://github.com/jkeen/tracking_number/blob/main/lib/tracking_number/base.rb)
- [CHECKSUM_ALGORITHMS.md](CHECKSUM_ALGORITHMS.md) - how each checksum in this repo works
- Reference documents, located/uploaded to the [wiki](https://github.com/jkeen/tracking_number_data/wiki/) for preservation
