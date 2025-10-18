# Automated-Bus-Management-And-Scheduling


https://openrouteservice.org/sign-up/ -api dashboard

https://outpost.mappls.com/api/sso/login.jsp api link

https://developer.mappls.com/mapping/routing-api# -docs


{
  "name": "KIT->RANKALA BUS STAND",
  "route_path": [
    {
      "lat": "16.654516170444477",
      "lng": "74.26181242815179",
      "name": "KIT"
    },
    {
      "lat": "16.66266039882179",
      "lng": "74.23993643687953",
      "name": "RK NAGAR"
    },
    {
      "lat": "16.67450066566595",
      "lng": "74.23676070133006",
      "name": "SUBHASH NAGAR CHOWK"
    },
    {
      "lat": "16.67844725844869",
      "lng":  "74.22397192844163",
      "name": "NIRMAN CHOWK"
    },
    {
      "lat": "16.696123705637177",
      "lng": "74.21847876424793",
      "name": "RANKALA BUS STAND"
    }
  ]
}

MapmyIndia.direction({
  start: "16.6871,74.2239", // lat,lng of start
  end: "16.705,74.2557",    // lat,lng of end
  via: ["16.7045,74.2433"], // optional middle stops
  resource: 'route_adv',
  profile: 'driving'
}, function(data) {
  console.log("Route data:", data);
});

