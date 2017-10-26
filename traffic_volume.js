 
 
 
  
  var view = {defaultcenter:[-122.2849808269088, 47.611172829128265],
                    set2Current: false};
  var map;
  var control = {layers:[], hours:[]};
  init();

  
  function init(){
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2VjZTE5IiwiYSI6ImNpaHBvNTBnZjA0NHZ0Nm00bGJoMDAxdDkifQ.Nj2-Tx6bRcpoliPuSqAGHw';
    var center = view.defaultcenter;
    
    var getPosition =  new Promise(function(resolve, reject){
        if(view.set2Current)
            navigator.geolocation.getCurrentPosition(resolve, reject);
        else
            reject(Error("Don't set to user's geo location"));});
       
    getPosition
       .then(function(position){
            center = [position.coords.longitude, position.coords.latitude];})
       .catch(function(err){
            console.log(err.message);})
       .then(function(){
            map = new mapboxgl.Map({
              container: 'map', // container id
              style: 'mapbox://styles/mapbox/dark-v9', //hosted style id
              center: center, // starting position
              zoom: 11 ,
              });
            document.getElementsByClassName('mapboxgl-ctrl-logo')[0].outerHTML = '';
            map.on('load', add_volume_json);
            
            map.on('click', select_feature);
            map.on('data',function(){document.getElementById('sourceStatus').innerHTML = 'Map Refreshing....';});
            map.on('render',mapRenderStatus);
            map.on('error',function(){document.getElementById('sourceStatus').innerHTML = 'Something went wrong....';});
          
       }); 
  };
  
  function select_feature(e){
        var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
        for(const layerid of control.layers.reverse()){
            var features = map.queryRenderedFeatures(bbox, { layers: [layerid] });
            var display = "";
            if(features.length>0){
                for(var i = 0;i<features.length;i++)
                    display = display + JSON.stringify(features[i].properties,null,2) + "<br />";
                    
                window.features = features;
                new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(display)
                .addTo(map);
                break;
            };
    
        };
  };
  
  function mapRenderStatus(e){
    if(map.loaded()){
        document.getElementById('sourceStatus').innerHTML = 'Map Loaded';
    }
  };
  
  function setHourLabel(hour){
    document.getElementById('hour').textContent = control.hours[hour];
  }
  
  function add_volume_json(){
    var sources = {};
    var filters = {};
    var layers = {}
    control.hours = ['12 am', '1 am', '2 am', '3 am','4 am','5 am','6 am','7 am','8 am','9 am','10 am','11 am','12 pm',
    '1 pm','2 pm','3 pm','4 pm','5 pm','6 pm','7 pm','8 pm','9 pm','10 pm','11 pm'];
    for(var i=0; i<24; i++){
        sources[i] = [{"type":"geojson", "data":'./data/pacnorth/traffic_hr' + i +'_layer1.geojson'},
                      {"type":"geojson", "data":'./data/pacnorth/traffic_hr' + i +'_layer2.geojson'},
                      {"type":"geojson", "data":'./data/pacnorth/traffic_hr' + i +'_layer3.geojson'},
                      {"type":"geojson", "data":'./data/pacnorth/traffic_hr' + i +'_layer4.geojson'}];
        
    };
    
    control.sources = sources;
    var init_tf=0;
    setHourLabel(init_tf);
    
    map.addSource('traffic_volume_hr_layer0', sources[init_tf][0]);
    map.addSource('traffic_volume_hr_layer1', sources[init_tf][1]);
    map.addSource('traffic_volume_hr_layer2', sources[init_tf][2]);
    map.addSource('traffic_volume_hr_layer3', sources[init_tf][3]);
    var layer0 = {'id': "traffic_volume_hr_slim", 'type':'line', 'source':"traffic_volume_hr_layer0",
                paint:{"line-color":"#F1E1A0", 'line-width':1, 'line-opacity':0.1},
                'layout': {"line-join": "round", "line-cap": "round", 'visibility': 'visible'}};
    var layer1 = {'id': "traffic_volume_hr_low", 'type':'line', 'source':"traffic_volume_hr_layer1",
                paint:{"line-color":"#F1E1A0", 'line-width':1, 'line-opacity':0.3},
                'layout': {"line-join": "round", "line-cap": "round", 'visibility': 'visible'}};
    var layer2 = {'id': "traffic_volume_hr_median", 'type':'line', 'source':"traffic_volume_hr_layer2",
                paint:{"line-color":"#F1E1A0", 'line-width':1, 'line-opacity':0.3},
                'layout': {"line-join": "round", "line-cap": "round", 'visibility': 'visible'}};
    var layer3 = {'id': "traffic_volume_hr_high", 'type':'line', 'source':"traffic_volume_hr_layer3",
                paint:{"line-color":"#F1E1A0", 'line-width':1, 'line-opacity':1},
                'layout': {"line-join": "round", "line-cap": "round", 'visibility': 'visible'}};
    map.addLayer(layer0);
    map.addLayer(layer1);
    map.addLayer(layer2);
    map.addLayer(layer3);
    control.layers = [layer0.id, layer1.id, layer2.id, layer3.id];
    
    document.getElementById('slider').addEventListener('input', function(e) {
            var hour = parseInt(e.target.value, 10);
            console.log(hour);
            
            setHourLabel(hour);
            show_traffic(hour);
        });
  };  
  
  function show_traffic(frame){
          currentsource = control.sources[frame];
          map.getSource('traffic_volume_hr_layer0').setData(currentsource[0].data);
          map.getSource('traffic_volume_hr_layer1').setData(currentsource[1].data);
          map.getSource('traffic_volume_hr_layer2').setData(currentsource[2].data);
          map.getSource('traffic_volume_hr_layer3').setData(currentsource[3].data);
          console.log(currentsource[2]);
          
          setHourLabel(frame);
          
          
  };
  /*
  function animation(){
      var frame = 0;
      var currentsource;
      console.log('getting into animation');
      function show_frame(){
          currentsource = control.sources[frame];
          map.getSource('traffic_volume_hr_layer1').setData(currentsource[0].data);
          map.getSource('traffic_volume_hr_layer2').setData(currentsource[1].data);
          map.getSource('traffic_volume_hr_layer3').setData(currentsource[2].data);

          //document.getElementById('info').innerHTML = 'Current Time: '+frame+":00";
          setHourLabel(frame);
          console.log('Current Time: '+frame+":00");
          frame = (frame+1)%24;
        
      };
      setInterval(show_frame, 4000);
      //return show_frame;
  };*/
  
  