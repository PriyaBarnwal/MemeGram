let cleanMemeCache
if(navigator.serviceWorker) {
  navigator.serviceWorker.register('service-worker.js')
    .catch(console.error)

  cleanMemeCache = (data) => {
    navigator.serviceWorker.getRegistration().then((registration) => {
      registration.active && registration.active.postMessage({action: 'cleanmemecache', data: data})
    })
  }
}

let dataContainer = document.getElementById('data'),
  alert = document.querySelector('.alert'),
  spinner = document.querySelector('.spinner')

let update= async() =>{
  spinner.classList.toggle('reloading')

  fetch('http://localhost:5000/getMemes')
    .then(async res =>  {
      let response = await res.json()
      dataContainer.innerHTML = ''

        response.data.forEach(element => {
          if(element) {
          let x = document.createElement("div"),
            y = document.createElement("img")

          x.classList.add('col-md-6', 'p-1')
          y.classList.add('w-100', 'img-fluid', 'border-black')
          y.setAttribute('src', element)
          x.appendChild(y)
            
          dataContainer.appendChild(x)
          }
        })

        navigator.serviceWorker && cleanMemeCache(response.data)
      }
    )
    .catch(console.error)
    .finally(()=> {
      spinner.classList.toggle('reloading')
    })

    return false
}

spinner.addEventListener('click', update)

update()
