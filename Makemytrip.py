#!/usr/bin/python

import urllib2
import json
import sys
import re
import cgi
from datetime import datetime,date,time

BASE_URL="http://flights.makemytrip.com/makemytrip/"
RESULTS_RANGE = 10
SEARCH_TAG = "var flightsData = ";

class MakeMyTrip(object):
    
    def browse(self,url="", roundtrip=False):
        url_browse = urllib2.urlopen(url).read()
        for line in url_browse.split("\n"):
            if SEARCH_TAG in line:
                flights_data = line.replace(SEARCH_TAG,"").strip(";")
                break
        json_list = json.loads(flights_data)
        return json_list
    
    def journey_oneway(self,origin,destination,depart_date,adult=1,children=0,infant=0):
        new_url = BASE_URL + "search/O/O/E/"+str(adult)+"/"+str(children)+"/"+str(infant)+"/S/V0/"+ origin + "_" + destination +"_" + depart_date
        return self.browse(new_url)
        
    def check_for_hop(self,flights_data):
        return True if (len(flights_data)-1) > 0 else False
        
    def create_json(self,l):
        json_object = {}
        json_object['origin'] = l['le'][0]['f']
        json_object['destination'] = l['le'][len(l['le'])-1]['t']
        json_object['duration'] = l['td']
        json_object['price'] = l['af']
        json_object['type'] = 'Flight'
        json_object['name'] = l['le'][0]['an']
        json_object['depart_time'] = l['le'][0]['fdt']
        json_object['depart_date'] = l['le'][0]['fd']
        json_object['arrival_time'] = l['le'][len(l['le'])-1]['fat']
        json_object['arrival_date'] = l['le'][len(l['le'])-1]['fa']
        json_object['hop'] = []
        for x in range(len(l['le'])):
            if x > 0:
                json_hop_object = {}
                json_hop_object['place'] = l['le'][x]['f']
                json_hop_object['time'] = l['le'][x]['lo']
                json_object['hop'].append(json_hop_object)
        return json_object
        
    def get_json(self,l,if_hop_allowed):
        tmp_size = len(l)
        json_list = []
        if if_hop_allowed == True:
            if tmp_size > RESULTS_RANGE:
                tmp_size = RESULTS_RANGE
            for i in range(tmp_size):
                json_list.append(self.create_json(l[i]))
        else:
            no_hop_count = 0
            counter = 0
            while no_hop_count < RESULTS_RANGE and counter < tmp_size:
                if self.check_for_hop(l[counter]['le']) == False:
                    json_list.append(self.create_json(l[counter]))
                    no_hop_count+=1
                counter+=1
        sys.stdout.write(json.dumps(json_list,indent=1))
        
def get_results(origin,destination,dateStr,if_hop_allowed=False):
        mmt = MakeMyTrip()
        date = datetime.strptime(dateStr,"%d/%m/%Y")
        mmt.get_json(mmt.journey_oneway(origin,destination,date.strftime("%d-%m-%Y")),if_hop_allowed)
        
sys.stdout.write("Content-Type: application/json")
sys.stdout.write("\n\n")
fs = cgi.FieldStorage()
get_results(fs.getvalue("origin"),fs.getvalue("destination"),fs.getvalue("date"))

                
    
    
    