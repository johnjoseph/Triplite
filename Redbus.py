#!/usr/bin/python

import json
import sys
import re
import cgi
import requests
import pytz
from datetime import datetime,date,time

BASE_URL="https://mobapi.redbus.in/wdsvc/v1_1/bussearch?"
RESULTS_RANGE = 10
orig = ""
dest = ""

class RedBus(object):
    
    def browse(self,url,roundtrip=False):
        url_browse = requests.get(url)
        if url_browse.json()['status'] == 400:
            print "[]"
        json_list = url_browse.json()
        return json_list
        
    def journey_oneway(self,origin,destination,depart_date):
        new_url = BASE_URL + "fromCityId=" + origin + "&toCityId=" + destination + "&doj=" + depart_date
        return self.browse(new_url)
        
    def create_json(self,l):
        json_object = {}
        json_object['origin'] = orig
        json_object['destination'] = dest
        json_object['duration'] = str(int(l['jDur'])//60)+"h "+str(int(l['jDur'])%60)+"m"
        json_object['price'] = (str(l['FrLst'][0])).split(".")[0]
        json_object['type'] = 'Bus'
        json_object['name'] = l['Tvs']
        depart_datetime=int(str(l['DpTm'])[6:].split("+")[0])/1000;
        arrival_datetime=int(str(l['ArTm'])[6:].split("+")[0])/1000;
        local_tz = pytz.timezone('Asia/Calcutta')
        depart_date=datetime.fromtimestamp(depart_datetime,local_tz).strftime("%Y,%d %b")
        depart_time=datetime.fromtimestamp(depart_datetime,local_tz).strftime("%H:%M")
        arrival_date=datetime.fromtimestamp(arrival_datetime,local_tz).strftime("%Y,%d %b")
        arrival_time=datetime.fromtimestamp(arrival_datetime,local_tz).strftime("%H:%M")
        json_object['depart_time']=depart_time
        json_object['depart_date']=depart_date
        json_object['arrival_time']=arrival_time
        json_object['arrival_date']=arrival_date
        return json_object
        
    def get_json(self,l):
        tmp_size = len(l['data'])
        json_list = []
        if tmp_size > RESULTS_RANGE:
            tmp_size = RESULTS_RANGE
        for i in range(tmp_size):
            json_list.append(self.create_json(l['data'][i]))
        sys.stdout.write(json.dumps(json_list,indent=1))
        
def get_results(origin,destination,dateStr):
    rdb = RedBus()
    date = datetime.strptime(dateStr,"%d/%m/%Y")
    orig = origin
    dest = destination
    rdb.get_json(rdb.journey_oneway(origin,destination,date.strftime("%d-%b-%Y")))

sys.stdout.write("Content-Type: application/json")
sys.stdout.write("\n\n")
fs = cgi.FieldStorage()
get_results(fs.getvalue('origin'),fs.getvalue('destination'),fs.getvalue('date'))




        
        