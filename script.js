let searchRow = document.getElementById('searchRow');
let componentsArr = [
    {
      type: "text",
      displayName: "Hello"
    },
    {
      type: "lookup",
      displayName: "World"
    }
  ]
let components = JSON.stringify(componentsArr)
searchRow.setAttribute('components', components);