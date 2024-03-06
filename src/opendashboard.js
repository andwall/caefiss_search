function openDashboard() {

   import('caefiss_components.js').then((m) => {
      var util = new m.CAEFISS();
      util.searchRB(); 
   });

 }
