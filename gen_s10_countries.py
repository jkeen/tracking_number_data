#!/usr/bin/env python
"""Update the file s10_country_code.json with
the latest list of member countries

requirements:
    requests
    beautifulsoup
    grequests
"""
import requests
import bs4
from os.path import join
import json
import grequests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

BASE_URL = "http://www.upu.int/"
URL = "http://www.upu.int/en/the-upu/member-countries.html"
OUT_FILE = "s10_countries.json"


def main():
    out_dct = {
        "_comment_s10_countries": (
            "The country code is part of the S10 standard for international"
            " mail.  The official reference for this is here:"
            " http://www.upu.int/uploads/tx_sbdownloader/"
            "S10TechnicalStandard.pdf"),
        "_comment_s10_countries": "Auto-generated file.  Do not modify."
    }
    reqs = grequests.imap(
        fetch_country_data(), size=15, exception_handler=exception_handler)
        #  (x for n, x in enumerate(fetch_country_data())
        #   if n < 200 and n > 190),
        #  size=3, exception_handler=exception_handler)
    out_dct['s10_countries'] = sorted(
        [gen_country_json_dct(req) for req in reqs], key=lambda x: x['country'])
    with open(OUT_FILE, 'w') as fout:
        json.dump(out_dct, fout, indent=2, ensure_ascii=False)


def exception_handler(request, exception):
    print("WARNING: Likely missing countries from this list.  Exception: %s"
          % repr(exception))


def fetch_country_data():
    r = requests.get(URL)
    soup = bs4.BeautifulSoup(r.content, 'html.parser')
    for tag in soup.find_all("strong", attrs={"itemprop": "member"}):
        href = tag.nextSibling()[0]
        url2 = href.attrs['href']
        yield grequests.get(
            join(BASE_URL, url2.lstrip('/')),
            session=retry(3)
        )


def gen_country_json_dct(request, *args, **kwargs):
    soup = bs4.BeautifulSoup(request.content, 'html.parser')
    attr_map = {
        "name": "country",
        "iso2": "country_code",
        "operator": [],  # special handling for this one
        "postcodes": "courier_url"
    }
    countrydct = {}
    for attr in attr_map:

        if attr == 'operator':
            value, child = _get_value(attr, soup)
            if value is None:  # try to get ministry
                value, child = _get_value("ministry", soup)
            countrydct['courier'] = child.next_element.text \
                if value is not None else None
            countrydct['courier_url2'] = value
        else:
            value, child = _get_value(attr, soup)
            countrydct[attr_map[attr]] = value
    if countrydct['courier_url'] is None:
        countrydct['courier_url'] = countrydct['courier_url2']
    countrydct.pop('courier_url2')

    countrydct['upu_reference_url'] = request.url
    if countrydct['country_code']:
        countrydct['regex'] = (
            "(?<ApplicationIdentifier>[A-Z]{2})"
            "(?<SerialNumber>[0-9]{8})"
            "(?<CheckDigit>[0-9])"
            "(?<CountryCode>%s{2})") % countrydct['country_code']
    else:
        countrydct['regex'] = None
    globals().update(locals())
    return countrydct


def _get_value(attr, soup):
    _child = soup.find("div", class_=attr)
    if _child is None:
        return None, None
    child = _child.findChild(class_="field")
    if child.next_element.name == "a":
        # special handling for links
        value = child.next_element.attrs['href']
    elif child.next_element.name == "span" and \
            child.next_element.attrs['class'] == ["noLink"]:
        # special handling for cases where we expect a link but UPU
        # doesn't have one for us
        value = None
    else:
        value = child.text.encode().decode('utf8')
    if value == 'None':
        value = None
    return value, child


def retry(n):
    s = requests.Session()
    retries = Retry(
        total=n, backoff_factor=0.2, status_forcelist=[500, 502, 503, 504],
        raise_on_redirect=True, raise_on_status=True)
    s.mount('http://', HTTPAdapter(max_retries=retries))
    s.mount('https://', HTTPAdapter(max_retries=retries))
    return s


if __name__ == '__main__':
    main()

    # for testing:
    # r = requests.get(
    #  "http://www.upu.int/en/the-upu/member-countries/americas/nicaragua.html")
    # gen_country_json_dct(r)
