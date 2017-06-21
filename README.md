http://www.gs1-128.info/sscc-18/
http://www.upu.int/uploads/tx_sbdownloader/S10TechnicalStandard.pdf

  # 20 charss { "fedexsscc-18": "regex": "\d{2}(?<container_type>\d)(?<shipper_id>\d{7})(?<serial>\d{9})(?<check>\d)"}
    "UCC/EAN 128": "regex": ""


http://answers.google.com/answers/threadview/id/207899.html



fedex:

- http://images.fedex.com/us/solutions/ppe/FedEx_Ground_Label_Layout_Specification.pdf
- http://stackoverflow.com/questions/15744704/how-to-calculate-a-fedex-smartpost-tracking-number-check-digit

usps:

- http://about.usps.com/publications/pub97.pdf
  - "Electronic File Number"
  - "Package Identification Code (PIC)"
- 13 char code uses two check digit algos:
  - mod10 (for domestic only)
  - s10 (for international or domestic mail)

- other links:
  - http://about.usps.com/publications/pub97/pub97_appj_020.htm
  - http://about.usps.com/publications/pub97/pub97_appj_021.htm
