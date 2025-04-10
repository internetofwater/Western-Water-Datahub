/*
This file is a modified version of https://www.cbrfc.noaa.gov/wsup/graph/west/map/esp_map.js

It is called from the map at https://www.cbrfc.noaa.gov/wsup/graph/west/map/esp_map.html
and essentially does multiple fetches and then joins together into one json that represents the
forecasts for all basins
*/



var markers=[];
var mpoints=[];
var wsupall;
var wsupmarker = 'espavg';

var fgclip;
var fglist;

var map, basins;
var riverLayer,rfcLayer,fgroupLayer,basinLayer,countyLayer,bmlayer;
var fg="";
var select_results, mtitle, mstatus;

bls=[];
var cb_date;
var cb_latest;
var cb_end;
var cb_az;

var ab_date;
var ab_latest;
var ab_end;

var wg_date;
var wg_latest;
var wg_end;

var mb_date;
var mb_latest;

var cn_date;
var cn_latest;

var nw_date;
var nw_latest;

var now = new Date();
var wyr = now.getFullYear();
var cmo = now.getMonth()+1;
if (cmo > 9) wyr++;

function getData() {
    cb_latest="";
    cb_end="";
    cb_az="";

    var fdate_latest="LATEST";
    var cb_fdate_end=wyr+"-07-15";
    var cb_fdate_az=wyr+"-5-30";
    var ab_fdate_end=wyr+"-06-29";
    var wg_fdate_end=wyr+"-07-15";


    if (!true) {
        var date_str=document.getElementById('espdt').value;
        var src_date='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+date_str+'&area=CB&qpfdays=0&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_ab_date='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+date_str+'&area=AB&qpfdays=1&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_wg_date='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+date_str+'&area=WG&qpfdays=0&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_mb_date='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+date_str+'&area=MB&qpfdays=1&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_cn_date='https://www.cbrfc.noaa.gov/wsup/graph/west/map/esp_data_cnrfc.py?fdate='+date_str+"&ts="+Date.now()/6*60*60;
        var src_nw_date='https://www.cbrfc.noaa.gov/wsup/graph/west/map/esp_data_nwrfc.py?fdate='+date_str+"&ts="+Date.now()/6*60*60;


        Promise.all([
            fetch(src_date).then(response=>response.json()).then(res=>{cb_date=data2obj(res)}),
            fetch(src_ab_date).then(response=>response.json()).then(res=>{ab_date=data2obj(res)}),
            fetch(src_wg_date).then(response=>response.json()).then(res=>{wg_date=data2obj(res)}),
            fetch(src_mb_date).then(response=>response.json()).then(res=>{mb_date=data2obj(res)}),
            fetch(src_cn_date).then(response=>response.json()).then(res=>{cn_date=data2obj(res)}),
            fetch(src_nw_date).then(response=>response.json()).then(res=>{nw_date=data2obj(res)}),

        ]).then(res=>gotData());
        //writestatus();
    } else {
        var src_latest='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+fdate_latest+'&area=CB&qpfdays=0&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_end='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+cb_fdate_end+'&area=CB&qpfdays=0&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_az='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+cb_fdate_az+'&area=CB&qpfdays=0&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_ab_latest='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+fdate_latest+'&area=AB&qpfdays=1&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_ab_end='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+ab_fdate_end+'&area=AB&qpfdays=1&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_wg_latest='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+fdate_latest+'&area=WG&qpfdays=0&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_wg_end='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+wg_fdate_end+'&area=WG&qpfdays=0&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_mb_latest='https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate='+fdate_latest+'&area=MB&qpfdays=1&otype=json'+"&ts="+Date.now()/6*60*60;
        var src_cn_latest='https://www.cbrfc.noaa.gov/wsup/graph/west/map/esp_data_cnrfc.py?'+"&ts="+Date.now()/6*60*60;
        var src_nw_latest='https://www.cbrfc.noaa.gov/wsup/graph/west/map/esp_data_nwrfc.py?'+"&ts="+Date.now()/6*60*60;

        Promise.all([
            fetch(src_latest).then(response=>response.json()).then(res=>{cb_latest=data2obj(res)}),
            fetch(src_end).then(response=>response.json()).then(res=>{cb_end=data2obj(res)}),
            fetch(src_az).then(response=>response.json()).then(res=>{cb_az=data2obj(res)}),
            fetch(src_ab_latest).then(response=>response.json()).then(res=>{ab_latest=data2obj(res)}),
            fetch(src_ab_end).then(response=>response.json()).then(res=>{ab_end=data2obj(res)}),
            fetch(src_wg_latest).then(response=>response.json()).then(res=>{wg_latest=data2obj(res)}),
            fetch(src_wg_end).then(response=>response.json()).then(res=>{wg_end=data2obj(res)}),
            fetch(src_mb_latest).then(response=>response.json()).then(res=>{mb_latest=data2obj(res)}),
            fetch(src_cn_latest).then(response=>response.json()).then(res=>{cn_latest=data2obj(res)}),
            fetch(src_nw_latest).then(response=>response.json()).then(res=>{nw_latest=data2obj(res)}),

        ]).then(res=>gotData());
    }
}

function calcFill(point) {
    point['id'] = point['espid'];
    point['fdate'] = point['espfdate'];
    point['des'] = point['espname'];
    point['lat'] =  point['esplatdd'];
    point['lng'] =  point['esplngdd'];
    point['p50'] =  point['espp_500'];
    point['p10'] = point['espp_100'];
    point['p90'] = point['espp_900'];
    point['normal'] =  point['espavg30'];
    point['pnormal'] = point['esppavg'];
    point['bper'] =  point['espbper'];
    point['eper'] =  point['espeper'];
    point['qpfdays'] =  point['espqpfdays'];

    if (point['wsobasin'] != "AB" && point['wsobasin'] != "MB" && point['wsobasin'] != "WG" && point['wsobasin'] != "CN" && point['wsobasin'] != "NW") {
        point['rfc'] = "CB"
    } else {
        point['rfc'] = point['wsobasin']
    }

    point['link'] = 'http://www.cbrfc.noaa.gov/wsup/graph/espgraph_hc.html?id='+point['id'];
    point['plot'] = 'https://www.cbrfc.noaa.gov/dbdata/wsup/graph/espgraph_hc.py?id='+point['id'];
    point['plotw'] = 700;
    point['ploth'] = 389;
    if (point['wsobasin'] == "CN") {
        point['link']="https://www.cnrfc.noaa.gov/ensembleProduct.php?prodID=7&id="+point['id'];
        point['plot']=""
    }
    if (point['wsobasin'] == "NW") {
        point['link']="https://www.nwrfc.noaa.gov/water_supply/ws_forecasts.php?id="+point['id'];
        point['plot']="https://www.nwrfc.noaa.gov/water_supply/ws_boxplot.php?_jpg_csimd=1&start_month=APR&end_month=SEP&fcst_method=ESP10&overlay=4&image_only=1&fit=0&show_min_max=0&id="+point['id']+"&water_year="+wyr;
        point['plotw'] = 543;
        point['ploth'] = 400;
    }
    
    if (point.pnormal == -1) {
        point.pnormal = ""
    }

    var pstat, fill;
    if (point.pnormal == "" || point.pnormal == 0) {
        pstat=0;
    } else {
        point.p50 = parseFloat(point.p50);
        point.normal = parseFloat(point.normal);	
        point.pnormal = parseFloat(point.pnormal);			
    }
    point.forecast_fill=fill;

    return(point);
}

function data2obj(data) {
    obj={};
    var i=0;
    for (id of data['espid']) {
        var child={};
        for (key of Object.keys(data)) {
            child[key]=data[key][i]
        }
        obj[id]=calcFill(child);
        //obj[id]=child;
        i++;
    }
    return(obj)
}

function gotData() {
    points=[];

    // console.log(cb_latest);
    // console.log(cb_end);
    // console.log(cb_az);

    if (!true) {
        var i=0;
        for (id in cb_date) {
            points[i]=cb_date[id];
            i++;
        }
        for (id in ab_date) {
            points[i]=ab_date[id];
            i++;
        }
        for (id in wg_date) {
            points[i]=wg_date[id];
            i++;
        }
        for (id in mb_date) {
            points[i]=mb_date[id];
            i++;
        }
        for (id in cn_date) {
            points[i]=cn_date[id];
            i++;
        }
        for (id in nw_date) {
            points[i]=nw_date[id];
            i++;
        }

    } else {

        var i=0;
        for (id in cb_latest) {
            
            if (cb_latest[id]['p50'] != 0 ) {
                points[i]=cb_latest[id];
            } else if (cb_end[id]['p50'] != 0) {
                points[i]=cb_end[id];
            } else if (cb_az[id]['p50'] != 0) {
                points[i]=cb_az[id];
            } else {
                points[i]=cb_latest[id];
            }
            //if (cb_latest['espp_500'][i] == 0) 
            //console.log(cb_end['espid'].indexOf(id));
            i++;
        }
        for (id in ab_latest) {
            
            if (ab_latest[id]['p50'] != 0) {
                points[i]=ab_latest[id];
            } else if (ab_end[id]['p50'] != 0) {
                points[i]=ab_end[id];
            } else {
                points[i]=ab_latest[id];
            }
            i++;
        }
        for (id in wg_latest) {
            if (wg_latest[id]['p50'] != 0) {
                points[i]=wg_latest[id];
            } else if (wg_end[id]['p50'] != 0) {
                points[i]=wg_end[id];
            } else {
                points[i]=wg_latest[id];
            }
            i++;
        }

        for (id in mb_latest) {
            points[i]=mb_latest[id];
            i++;
        }
        for (id in cn_latest) {
            points[i]=cn_latest[id];
            i++;
        }
        for (id in nw_latest) {
            points[i]=nw_latest[id];
            i++;
        }
    }

    console.log(points);
    console.log(points.length)

}


getData()
gotData()

