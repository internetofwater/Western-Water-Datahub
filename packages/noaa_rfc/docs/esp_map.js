

function clean(str, len) {
    str=str.replace(/[^a-z0-9-_.]/gi, '');
    str=str.substring(0,len);
    return(str);
}


var wsmonths=["","October","November","December","January","February","March","April","May","June","July","August","September"];

function titleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
var search_text="";

var west_lat=42.65;

var west_lng=-114.17;

var west_zlevel=5;

var csvdate="";

var autopanning = false;

var thresholds = [.25,.5,.75,.9,1.1,1.25,1.50];

var year, maxDt, minDt, stat_type;

var markers=[];
var mpoints=[];
//var selected_marker;

var wsupall;
var wsupmarker = 'espavg';

var points=0;

var fgclip;
var fglist;

var map, basins;
var riverLayer,rfcLayer,fgroupLayer,basinLayer,countyLayer,bmlayer;
var search_text;
var fg="";
var select_results, mtitle, mstatus;


function double(s) {
	s=s+"";
	if (s.length==1) {
		s="0"+s;
	}
	return(s);
}

function pointInfo(index) {
	var html=[];
    if (points[index]['plot'] == "" || !document.getElementById("espLatest").checked) {
        html.push("<h5>"+pointLabel(index)+" ("+points[index].id+")</h5>");
        html.push("Issued By: "+points[index]['rfc']+"RFC<br>");
        html.push("Forecast Period: "+wsmonths[parseInt(points[index].bper)]+" - "+wsmonths[parseInt(points[index].eper)]+"<br>");
        html.push("QPF: "+points[index]['qpfdays']+" Days<br>");

        if (points[index].pnormal == 0) {
            html.push("No Current Forecast<br>");
        } else {
            html.push("Forecast Date: "+points[index].fdate+"<br>");
            if (points[index].p50 != "") html.push("Forecast: "+"<b>"+points[index].p50.toFixed(0)+" kaf</b>"+"<br>");
            if (points[index].normal != "") html.push("Normal: "+points[index].normal.toFixed(0)+" kaf<br>");
            if (points[index].pnormal != "") html.push("Pct Normal: "+points[index].pnormal.toFixed(0)+"%<br>");

        }

        html.push("<a target=_blank href="+points[index].link+">More Info</a><br>");
    } else {
        html.push("<a target=_blank href="+points[index].link+"><img alt=loading width="+points[index]['plotw']+" height="+points[index]['ploth']+" src="+points[index]['plot']+"></a><br>");
    }
	return(html.join("\n"));
}

function iconSVG(type, fill) {

	var width = 14;
	var height = 14;
	var size = 14;

	if (L.Browser.mobile) {
		width = 16;
		height = 16;
		size = 16;
	}

	var stroke = "#222";
	var stroke_width = 1;
    var rad = size/2-stroke_width;
    var x1 = stroke_width;
    var x2 = size/2;
    var x3 = size-stroke_width;
    var y1 = stroke_width;
    var y2 = size-stroke_width;
	var sqsize = size-stroke_width*2;
	var sqx = stroke_width;
	var sqy = stroke_width;

	var svg="";

	if (type == "circle") {
		svg = "<svg height='"+height+"' viewBox='0 0 "+size+" "+size+"' width='"+width+"' xmlns='http://www.w3.org/2000/svg'>";
		svg = svg+"<circle cx='"+size/2+"' cy='"+size/2+"' r='"+rad+"' style='stroke: "+stroke+"; stroke-width: "+stroke_width+"; fill: "+fill+"'/>";
		svg = svg+"</svg>";
	} else if (type == "square") {
		var svg = "<svg height='"+height+"' viewBox='0 0 "+size+" "+size+"' width='"+width+"' xmlns='http://www.w3.org/2000/svg'>";
		svg = svg+"<rect x='"+sqx+"' y='"+sqy+"' height='"+sqsize+"' width='"+sqsize+"' style='stroke: "+stroke+"; stroke-width: "+stroke_width+"; fill: "+fill+"'/>";
		svg = svg+"</svg>";
	} else if (type == "up") {
		svg = "<svg height='"+height+"' viewBox='0 0 "+size+" "+size+"' width='"+width+"' xmlns='http://www.w3.org/2000/svg'>";
		svg = svg+"<polygon points='"+x2+","+y1+" "+x3+","+y2+" "+x1+","+y2+"' style='stroke: "+stroke+"; stroke-width: "+stroke_width+"; fill: "+fill+"'/>";
		svg = svg+"</svg>";
	} else if (type == "down") {
		svg = "<svg height='"+height+"' viewBox='0 0 "+size+" "+size+"' width='"+width+"' xmlns='http://www.w3.org/2000/svg'>";
		svg = svg+"<polygon points='"+x1+","+y1+" "+x3+","+y1+" "+x2+","+y2+"' style='stroke: "+stroke+"; stroke-width: "+stroke_width+"; fill: "+fill+"'/>";
		svg = svg+"</svg>";
	}
	return(svg);
}

function makePoint(index) {
	var fill=points[index].forecast_fill;
	var type = "circle";

	var svg = iconSVG(type,fill);
	var p = L.latLng(points[index].lat, points[index].lng);
	var icon = L.divIcon({html:svg, className: "", iconAnchor: L.point(7, 7)})
	var marker = new L.marker(p,{icon: icon, title: pointLabel(index), riseOnHover: false, closeOnClick: false, autoClose: false});
	var popup = L.responsivePopup().setContent(pointInfo(index));
	marker.bindPopup(popup,{maxWidth:815,minWidth:400, offset: [5,5]});

	// marker.bindPopup(pointInfo(index),{maxWidth: 380, autoPan:true});

	//turn off click marker to close - doesn't work on touch devices
	marker.off('click');
	marker.on("click", function() {
	// 	pickSite(points[index].id, points[index].bper, points[index].eper);
		if (!this.isPopupOpen()) {
			this.openPopup()
		}
	});

	marker.addTo(map);
	return marker;
}

function find() {
	//selected_marker.setOpacity(0);
	console.log("find")
	search2();
	zoomfit();
}

function clearSearch() {
	search_box.value = "";
	find();
}
function search2() {
		//alert("search "+search_box.value);
		
		markers=[];
		mpoints=[];
		
		const searchval="river";

		var matches = [];
		for (var i=0;i < points.length;i++) {
			if (points[i].lat == 0) {continue;}
			var name=points[i].des.toLowerCase()+" "+points[i].id.toLowerCase();	
			if ((searchval == "") || (searchval!= "" && name.indexOf(searchval) != -1)) {
				markers[markers.length]=makePoint(i);
				mpoints[mpoints.length]=points[i];
				var j=markers.length-1;
				var info=label+"!"+j;
	
				if (searchval != "" || (bounds != null && bounds.contains(ll))) {
					matches.push(info);
				}
			}
		}

		if (matches.length > 0) {
			matches.sort();
			for (var i=0;i < matches.length;i++) {
				var opt = document.createElement("option");
				var match = matches[i].split("!");
       			opt.value = match[1];
        		opt.text = match[0].substring(0,30);
        		select_results.add(opt, null);
			}
		}
}

    
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

    for (var i=0;i < markers.length;i++) {
        map.removeLayer(markers[i]);
    }

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

function threshold(pct) {
    if (pct <= 25)
        i = 1
    else if (pct > 25 && pct <= 50)
        i = 2
    else if (pct > 50 && pct <= 75)
        i = 3
    else if (pct > 75 && pct <= 90)
        i = 4
    else if (pct > 90 && pct <= 110)
        i = 5
    else if (pct > 110 && pct <= 125)
        i = 6
    else if (pct > 125 && pct <= 150)
        i = 7
    else if (pct > 500)
        i = 8
    return i
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

}


getData()
gotData()

