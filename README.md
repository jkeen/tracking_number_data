[![Tests](https://github.com/jkeen/tracking_number_data/actions/workflows/tests.yml/badge.svg)](https://github.com/jkeen/tracking_number_data/actions/workflows/tests.yml)

# About

This repository contains json files that programatically describe how to detect, validate, and decode the following types of tracking numbers:

## Supported Tracking Numbers. Illustrated in depth on [trackingnumber.fyi](https://trackingnumber.fyi)

<!-- generated: supported tracking numbers -->

| Carrier | Type | Length | Examples | Data |
| --- | --- | --- | --- | --- |
| Amazon | Amazon Logistics | 15 | [`TBA000000000000`](https://trackingnumber.fyi/TBA000000000000) [`TBA010000000000`](https://trackingnumber.fyi/TBA010000000000) [`TBC000000000000`](https://trackingnumber.fyi/TBC000000000000) | `SerialNumber` |
|  | Amazon International | 11 | [`C1004444443`](https://trackingnumber.fyi/C1004444443) [`C1004444444`](https://trackingnumber.fyi/C1004444444) | `SerialNumber` |
| Canada Post | Canada Post (16) | 16 | [`0073938000549297`](https://trackingnumber.fyi/0073938000549297) [`7035114477138472`](https://trackingnumber.fyi/7035114477138472) [`4002847016405018`](https://trackingnumber.fyi/4002847016405018) | `SerialNumber` `OriginId` `CheckDigit` |
| DHL | DHL Express | 10-11 | [`3318810025`](https://trackingnumber.fyi/3318810025) [`73891051146`](https://trackingnumber.fyi/73891051146) [`8487135506`](https://trackingnumber.fyi/8487135506) | `SerialNumber` `CheckDigit` |
|  | DHL Express (Piece ID) | 13-14 | [`JJD0099999999`](https://trackingnumber.fyi/JJD0099999999) [`JVGL0999999990`](https://trackingnumber.fyi/JVGL0999999990) | `SerialNumber` |
|  | DHL E-Commerce | 18-22 | [`GM2951173225174494`](https://trackingnumber.fyi/GM2951173225174494) [`GM295117494011169042`](https://trackingnumber.fyi/GM295117494011169042) [`GM9E44608A27984866BA2D`](https://trackingnumber.fyi/GM9E44608A27984866BA2D) | `SerialNumber` |
|  | DHL E-Commerce (14) | 14 | [`60120172242323`](https://trackingnumber.fyi/60120172242323) [`51087693037816`](https://trackingnumber.fyi/51087693037816) [`60120174971147`](https://trackingnumber.fyi/60120174971147) | `SerialNumber` |
| DPD | DPD (28) | 28 | [`008182709980000020033350276C`](https://trackingnumber.fyi/008182709980000020033350276C) [`008182709980000020045327276N`](https://trackingnumber.fyi/008182709980000020045327276N) | `SerialNumber` `DestinationZip` `ServiceType` `CountryCode` `CheckDigit` |
|  | DPD (14) | 15 | [`09980000020033F`](https://trackingnumber.fyi/09980000020033F) [`09980000020034D`](https://trackingnumber.fyi/09980000020034D) | `SerialNumber` `CheckDigit` |
| FedEx | FedEx Express (12) | 12 | [`986578788855`](https://trackingnumber.fyi/986578788855) [`477179081230`](https://trackingnumber.fyi/477179081230) [`799531274483`](https://trackingnumber.fyi/799531274483) | `SerialNumber` `CheckDigit` |
|  | FedEx Express (34) | 34 | [`1001921334250001000300779017972697`](https://trackingnumber.fyi/1001921334250001000300779017972697) [`1001921380360001000300639585804382`](https://trackingnumber.fyi/1001921380360001000300639585804382) [`1001901781990001000300617767839437`](https://trackingnumber.fyi/1001901781990001000300617767839437) | `DestinationZip` `SerialNumber` `CheckDigit` |
|  | FedEx SmartPost | 20-30 | [`61299998820821171811`](https://trackingnumber.fyi/61299998820821171811) [`9261292700768711948021`](https://trackingnumber.fyi/9261292700768711948021) [`420112139261290983497923666238`](https://trackingnumber.fyi/420112139261290983497923666238) | `RoutingApplicationId` `DestinationZip` `ApplicationIdentifier` `SerialNumber` `SCNC` `ServiceType` `ShipperId` `PackageId` `CheckDigit` |
|  | FedEx Ground | 15 | [`041441760228964`](https://trackingnumber.fyi/041441760228964) [`568283610012000`](https://trackingnumber.fyi/568283610012000) [`568283610012734`](https://trackingnumber.fyi/568283610012734) | `SerialNumber` `CheckDigit` |
|  | FedEx Ground (SSCC-18) | 18 | [`000123450000000027`](https://trackingnumber.fyi/000123450000000027) | `ShippingContainerType` `SerialNumber` `CheckDigit` |
|  | FedEx Ground 96 (22) | 22 | [`9611020987654312345672`](https://trackingnumber.fyi/9611020987654312345672) | `ApplicationIdentifier` `SCNC` `ServiceType` `SerialNumber` `ShipperId` `PackageId` `CheckDigit` |
|  | FedEx Ground GSN | 34 | [`9622001900000000000000776632517510`](https://trackingnumber.fyi/9622001900000000000000776632517510) [`9622001560000000000000794808390594`](https://trackingnumber.fyi/9622001560000000000000794808390594) [`9622001560001234567100794808390594`](https://trackingnumber.fyi/9622001560001234567100794808390594) | `ApplicationIdentifier` `SCNC` `GSN` `SerialNumber` `CheckDigit` |
| Landmark Global LTN | Landmark Global LTN | 13 | [`LTN74207623N1`](https://trackingnumber.fyi/LTN74207623N1) [`LTN74209518N1`](https://trackingnumber.fyi/LTN74209518N1) [`LTN74224021N1`](https://trackingnumber.fyi/LTN74224021N1) | `SerialNumber` |
| LaserShip | LaserShip LX | 10 | [`LX17635036`](https://trackingnumber.fyi/LX17635036) [`LX17635035`](https://trackingnumber.fyi/LX17635035) [`LX17635034`](https://trackingnumber.fyi/LX17635034) | `SerialNumber` |
|  | LaserShip 1LS7 (15) | 15 | [`1LS717793482164`](https://trackingnumber.fyi/1LS717793482164) [`1LS724505321754`](https://trackingnumber.fyi/1LS724505321754) [`1LS720000000000`](https://trackingnumber.fyi/1LS720000000000) | `SerialNumber` |
|  | LaserShip 1LS7 (18) | 18 | [`1LS7119013618127-1`](https://trackingnumber.fyi/1LS7119013618127-1) | `SerialNumber` |
| Old Dominion Freight Line | Old Dominion | 11 | [`07209562763`](https://trackingnumber.fyi/07209562763) [`77767553207`](https://trackingnumber.fyi/77767553207) [`77806528897`](https://trackingnumber.fyi/77806528897) | `SerialNumber` `CheckDigit` |
|  | Old Dominion Guaranteed Shipment | 11 | [`80003280379`](https://trackingnumber.fyi/80003280379) [`80993847369`](https://trackingnumber.fyi/80993847369) | `SerialNumber` `CheckDigit` |
| OnTrac | OnTrac | 15 | [`C11031500001879`](https://trackingnumber.fyi/C11031500001879) [`C10999911320231`](https://trackingnumber.fyi/C10999911320231) [`C11121552953069`](https://trackingnumber.fyi/C11121552953069) | `SerialNumber` `CheckDigit` |
|  | OnTrac D | 15 | [`D10011354453707`](https://trackingnumber.fyi/D10011354453707) [`D10011345983010`](https://trackingnumber.fyi/D10011345983010) [`D10011342332145`](https://trackingnumber.fyi/D10011342332145) | `SerialNumber` `CheckDigit` |
| S10 International Standard | S10 | 13 | [`RB123456785GB`](https://trackingnumber.fyi/RB123456785GB) [`RB123456785US`](https://trackingnumber.fyi/RB123456785US) [`RB123456785CV`](https://trackingnumber.fyi/RB123456785CV) | `ServiceType` `SerialNumber` `CheckDigit` `CountryCode` |
| United States Postal Service | USPS 20 | 20 | [`03071790000523483741`](https://trackingnumber.fyi/03071790000523483741) [`71123456789123456787`](https://trackingnumber.fyi/71123456789123456787) | `SerialNumber` `ServiceType` `ShipperId` `PackageId` `CheckDigit` |
|  | USPS 34v2 | 34 | [`4201002334249200190132607600833457`](https://trackingnumber.fyi/4201002334249200190132607600833457) [`4201028200009261290113185417468510`](https://trackingnumber.fyi/4201028200009261290113185417468510) | `RoutingApplicationId` `DestinationZip` `RoutingNumber` `SerialNumber` `ApplicationIdentifier` `ShipperId` `PackageId` `CheckDigit` |
|  | USPS 91 | 20-30 | [`420221539101026837331000039521`](https://trackingnumber.fyi/420221539101026837331000039521) [`71969010756003077385`](https://trackingnumber.fyi/71969010756003077385) [`9505511069605048600624`](https://trackingnumber.fyi/9505511069605048600624) | `RoutingApplicationId` `DestinationZip` `SerialNumber` `ApplicationIdentifier` `SCNC` `ServiceType` `ShipperId` `PackageId` `CheckDigit` |
| UPS | UPS | 18 | [`1Z5R89390357567127`](https://trackingnumber.fyi/1Z5R89390357567127) [`1Z879E930346834440`](https://trackingnumber.fyi/1Z879E930346834440) [`1Z410E7W0392751591`](https://trackingnumber.fyi/1Z410E7W0392751591) | `SerialNumber` `ShipperId` `ServiceType` `PackageId` `CheckDigit` |
|  | UPS Waybill | 11 | [`K1506235620`](https://trackingnumber.fyi/K1506235620) [`K2479825491`](https://trackingnumber.fyi/K2479825491) [`J4603636537`](https://trackingnumber.fyi/J4603636537) | `ServiceType` `SerialNumber` `CheckDigit` |

<!-- /generated -->

## JSON Format

- **glossary.json** - what each part name means, wherever it appears

  Keyed by the regex group name, so any implementation reading `couriers/*.json` can say the same thing about a `SerialNumber` as any other. Each entry carries a `label` for showing the name to a person, and a `description` of what that part of a number is. A definition's own `glossary` overrides the description where it has something more exact to say.

  ```json
  "CheckDigit": {
    "label": "Check Digit",
    "description": "A digit derived from the serial number, used to catch a misread number."
  }
  ```

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

    - `glossary` - (optional) anything this format can say about its named groups that the group name cannot, keyed by group name. Only for the specific: `s10` says its serial is eight digits assigned by the issuing postal service. What `SerialNumber` means in general belongs in the top level `glossary.json`, not repeated on every definition.

        ```json
        "glossary": {
          "ServiceType": "Two letters naming the postal service class.",
          "SerialNumber": "Eight digits assigned by the issuing postal service."
        }
        ```

    - `description` - (optional) a note about the format itself, such as `"USPS now calls this the IMpd barcode format"`.

    - `validation` - Specifies how the tracking number is validated
      - `checksum`: if the tracking number has a checksum, include a `checksum` key with the details.
        - `name`: specifies the algorithm. Supported algorithms are `mod10`, `mod7`, `s10`, `luhn`, `mod_37_36` and `sum_product_with_weightings_and_modulo`.

        Each checksum carries the constants its algorithm uses, so an implementation does not have to hardcode them and two implementations cannot quietly disagree: `weightings` and `modulo` for `s10`, `modulo` for `mod7` and `luhn`, `modulo` and `alphabet` for `mod_37_36`, `evens_multiplier` and `odds_multiplier` for `mod10`, and `weightings` with `modulo1` and `modulo2` for the weighted sum. An implementation that hardcodes them keeps working; the keys are there to be read, not to be required.
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
