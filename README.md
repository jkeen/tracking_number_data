[![Tests](https://github.com/jkeen/tracking_number_data/actions/workflows/tests.yml/badge.svg)](https://github.com/jkeen/tracking_number_data/actions/workflows/tests.yml)

> Hey there tracking number enthusiast! I don't use this project in any production capacity, and really never have. I am not a tracking number expert, and I don't have inside connections to a shipping company—I'm just a guy that once tried to make a package tracking app and this gem is all that survived. When I have absolutely nothing to do it's kinda fun to tinker with, but time has become more and more of a precious resource. Anyway, maintaining this is thankless work, and if this project has been useful for you I sure would appreciate a cup or two of coffee slid my way as a token of appreciation. A PR would also be nice.
>
> <a href="https://www.buymeacoffee.com/jeffkeen" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: auto !important;width: 150px !important;" ></a>

# About

This repository contains json files that programatically describe how to detect, validate, and decode the following types of tracking numbers:

## Supported Tracking Numbers
| Carrier          | Type                      | Length | Example                                                   | Data                                                                                                                      |
| ---------------- | ------------------------- | ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Amazon**       | Amazon Logistics          | 15     | `TBA502887274000`                                         | `SerialNumber`                                                                                                            |
|                  | Amazon International      | 11     | `C1004444443`                                             | `SerialNumber`                                                                                                            |
| **Canada Post**  | Canada Post (16)          | 16     | `0073938000549297`                                        | `OriginId` `SerialNumber` `CheckDigit`                                                                                    |
| **DHL**          | DHL Express               | 10     | `3318810025`                                              | `SerialNumber` `CheckDigit`                                                                                               |
|                  | DHL Express (Piece ID)    | 11–13  | `JJD0099999999` `JVGL0999999990`                          | `SerialNumber`                                                                                                            |
|                  | DHL E-Commerce            | 18–39  | `GM2951173225174494` `GM9E44608A27984866BA2D`             | `SerialNumber`                                                                                                            |
|                  | DHL E-Commerce (14)       | 14     | `60120172242323` `51087693037816`                         | `SerialNumber`                                                                                                            |
|                  | DHL E-Commerce (30 / PIC) | 30     | `420902459261290336128704042634`                          | `RoutingApplicationId` `DestinationZip` `ServiceType` `ShipperId` `PackageId` `CheckDigit`                                |
| **DPD**          | DPD 14                    | 15     | `0998 0000 0200 34D`                                      | `SerialNumber`                                                                                                            |
|                  | DPD 28                    | 28     | `0081 827 0998 0000 0200 45 327 276 N`                    | `SerialNumber` `DestinationZip` `ServiceType` `CountryCode`                                                               |
| **FedEx**        | FedEx Express (12)        | 12     | `986578788855`                                            | `SerialNumber` `CheckDigit`                                                                                               |
|                  | FedEx Express (34)        | 34     | `1001921334250001000300779017972697`                      | `SerialNumber` `CheckDigit` `DestinationZip`                                                                              |
|                  | FedEx Ground              | 15     | `0414 4176 0228 964`                                      | `SerialNumber` `CheckDigit`                                                                                               |
|                  | FedEx Ground (SSCC-18)    | 18     | `00 0123 4500 0000 0027`                                  | `ShippingContainerType` `SerialNumber` `CheckDigit`                                                                       |
|                  | FedEx Ground (96)         | 22     | `9611020987654312345672`                                  | `ApplicationIdentifier` `SCNC` `ServiceType` `ShipperId` `PackageId` `CheckDigit`                                         |
|                  | FedEx Ground (GSN)        | 34     | `9622001560001234567100794808390594`                      | `ApplicationIdentifier` `SCNC` `GSN` `SerialNumber` `CheckDigit`                                                          |
|                  | FedEx SmartPost           | 20–34  | `61299998820821171811` `420112139261290983497923666238`   | `ApplicationIdentifier` `SCNC` `ServiceType` `ShipperId` `PackageId` `CheckDigit`                                         |
| **Landmark**     | Landmark Global LTN       | 13     | `LTN74207623N1`                                           | `SerialNumber`                                                                                                            |
| **LaserShip**    | LaserShip LX              | 9–10   | `LX17635036` `LI12976442`                                 | `SerialNumber`                                                                                                            |
|                  | LaserShip 1LS7 (15)       | 15     | `1LS717793482164`                                         | `SerialNumber`                                                                                                            |
|                  | LaserShip 1LS7 (18)       | 18     | `1LS7119013618127-1`                                      | `SerialNumber`                                                                                                            |
| **Old Dominion** | Old Dominion              | 11     | `78045768393`                                             | `SerialNumber` `CheckDigit`                                                                                               |
|                  | Old Dominion Guaranteed   | 11     | `80003280379`                                             | `SerialNumber` `CheckDigit`                                                                                               |
| **OnTrac**       | OnTrac C                  | 15     | `C11031500001879`                                         | `SerialNumber` `CheckDigit`                                                                                               |
|                  | OnTrac D                  | 15     | `D10011354453707`                                         | `SerialNumber` `CheckDigit`                                                                                               |
| **UPS**          | UPS                       | 18     | `1Z5R89390357567127`                                      | `SerialNumber` `CheckDigit` `ShipperId` `ServiceType` `PackageId`                                                         |
|                  | UPS Waybill               | 11     | `K2479825491` `V0490119172`                               | `ServiceType` `SerialNumber` `CheckDigit`                                                                                 |
| **USPS**         | USPS 20                   | 20     | `0307 1790 0005 2348 3741`                                | `ServiceType` `ShipperId` `PackageId` `CheckDigit`                                                                        |
|                  | USPS 22                   | 22–27  | `9400111206206406260787` `420787459400111206206406260787` | `RoutingApplicationId` `DestinationZip` `ServiceType` `ShipperId` `PackageId` `CheckDigit`                                |
|                  | USPS 34v2                 | 34     | `4201028200009261290113185417468510`                      | `RoutingApplicationId` `DestinationZip` `RoutingNumber` `ApplicationIdentifier` `ShipperId` `PackageId` `CheckDigit`      |
|                  | USPS 91 (IMpb)            | 25–34  | `420221539101026837331000039521` `9361289878700317633795` | `RoutingApplicationId` `DestinationZip` `ApplicationIdentifier` `SCNC` `ServiceType` `ShipperId` `PackageId` `CheckDigit` |

## JSON Format
- **couriers/*.json** - identifies the standard couriers that might send mail
  - Each courier is defined by json hash with the following keys

    - `name` - Identifies the courier
    - `courier_code` - short code to identify the courier. Alphanumeric only, no spaces.
    - `tracking_numbers` - an array of possible tracking number formats for this courier

  - Each tracking number type is defined by a json hash with the following keys:
    - `name` - A name to identify this type of tracking number. Usually includes the carrier in the name, i.e. `FedExGround`

    - `regex` - A pcre compatible regular expression that identifies the tracking number regardless of spaces in-between characters.

      Every regex must contain the named groups `SerialNumber` and `CheckDigit` and depending on the tracking number can optionally contain the following common attributes:

        - `ServiceType`: indicating the type of delivery service
        - `ShipperId`: indicating the shipper id
        - `PackageId`: indicating the package id
        - `DestinationZip`: indicating the destination zip code

    - `validation` - Specifies how the tracking number is validated
      - `checksum`: if the tracking number has a checksum, include a `checksum` key with the details.
        - `name`: specifies the algorithm. Supported algorithms and parameters are `mod10` `mod7` `s10`, and `sum_product_with_weightings_and_modulo`. Look at existing examples for parameters.
        ```JSON
        "validation": {
            "checksum": {
              "name": "mod10",
              "evens_multiplier": 1,
              "odds_multiplier": 2
            }
          }
        ```
      - `serial_number_format`: some tracking numbers require some modification of the <SerialNumber> group before validation. In the example below, the serial number needs a "91" prepended before validation unless the number starts with a 91, 92, 93, 94, or 95
        ```json
        "serial_number_format": {
            "prepend_if": {
              "matches_regex": "^(?!9[1-5]).+",
              "content": "91"
            }
          }
        ```
    - `tracking_url` - A url that we can use to find the tracking history for a particular tracking number. It assumes the tracking number can be entered using python style string formatting "www.courier.com?trackingnumber=%s".

    - `test_numbers`:
      - `valid`: an array of valid tracking numbers for testing
      - `invalid`: an array of invalid tracking numbers for testing

    - `additional` - (optional) further information relating to a named regex group can be specified. For instance, a lookup table for the `ServiceType` regex group, relating the two digit letter code with the type of service.

    ```json
        "additional": [
          {
            "name": "Service Type",
            "regex_group_name": "ServiceType",
            "lookup": [
              {
                "matches": "01",
                "name": "UPS United States Next Day Air (Red)"
              },
              {
                "matches": "02",
                "name": "UPS United States Second Day Air (Blue)"
              }
            ]
          }
        ]
    ```

    Each hash in the `lookup` array should contain a key called `matches` or `matces_regex`, specifying how the value of `regex_group_name` should be compared.


    - `partners` - Each entry of the partners array describes a possible partnership between carriers. A partnership is only valid if both ends of the partnership pass the checks. If the tracking number passes both sets of validation, this indicates that the shipment was handled by both parties, usually one acting as the _shipper_, and the other as the last mile _carrier_. Each item in the partners array should have:
      -  `partner_id`: (required) reference indicating the related definition
      -  `partner_type`: (required) indicating the type of relationship. Currently the two supported relationship types are `shipper` and `carrier`.
      -  `description`: (optional) mainly for humans reading this
      -  `validation`: (optional) a validation block that determins if this partnership applies
        -  `matches_all` or `matches_any`: array of match conditions. Each match condition must have a `regex_group_name` indicating the name of the regex group to match against, and then either a `matches` key or a `matches_regex` key with a string or a regex to match against

        ```json
            //usps.json

            "partners": [{
              "partner_id": "fedex_smartpost",
              "partner_type": "origin",
              "description": "FedEx SmartPost uses USPS for last mile delivery, but not all USPS91 numbers are SmartPosts",
              "validation": {
                "matches_all": [
                   {
                     "regex_group_name": "ServiceType",
                     "matches": "29"
                   },
                   {
                     "regex_group_name": "SCNC",
                     "matches": "62"
                   }
                ]
              }
            }],
        ```


### Making a contribution
- Modify or add definitions in the couriers/*.json files. Take a look at the existing ones, and follow the guidance above.
- Run the tests locally. `bundle exec rake` If they pass, it's good, submit a PR!


### Standard implementations of

- [Check digit algorithms](https://github.com/adgaudio/MysteryTrackingNumber/blob/master/src/main/java/com/adgaudio/mysterytrackingnumber/CheckDigitAlgorithms.java)
- [Serial number parsers](https://github.com/adgaudio/MysteryTrackingNumber/blob/master/src/main/java/com/adgaudio/mysterytrackingnumber/SerialNumberParsers.java)


# Using this repo:

### List of Libraries using this repository, by Language

We suggest you check these out before rolling your own implementation.

Ruby:
  - [tracking_number](https://github.com/jkeen/tracking_number)

JS/TS:
  - [ts-tracking-number](https://github.com/rjbrooksjr/ts-tracking-number)

Java:
  - [MysteryTrackingNumber](https://github.com/adgaudio/MysteryTrackingNumber)

Python:
  - [TrackingNumbers](https://github.com/jcomo/tracking-numbers/)

Go:
  - [go-package-tracking](https://github.com/Freespoke/go-package-tracking)

### I am creating a new library

If you are using this repo, it is most likely because you are writing a
library to get information out of tracking numbers.

1. Please check that your chosen programming language does not already have an
   implementation of a tracking number parser that uses these json files.
2. If you are creating a new library, great!  Open an issue and let us
   know.  We're happy to help!

### I found a bug or missing couriers.

- Open an issue and specify the tracking numbers and courier service.
- PRs: Feel free to modify any json file that does not specify it is
   auto-generated by a script.  Run `./lint_json.sh` to clean up and
   validate the json file (you may need jq or other dependencies).

---

# Reference Documents
Located/uploaded to the [wiki](https://github.com/jkeen/tracking_number_data/wiki/Reference-Documents/) for preservation
