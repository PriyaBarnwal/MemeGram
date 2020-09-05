const version = '1.1'
let static_assets = [
  '/',
  'index.html', 
  'main.js', 
  'vendor/jquery.min.js', 
  'vendor/bootstrap.min.css',
  'images/logo.png',
  'images/sync.png'
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(`static-version${version}`).then(cache =>
      cache.addAll(static_assets)
    ))
})

self.addEventListener('activate', (e) => {
  let cleanCaches = caches.keys().then(cacheKeys => {
    cacheKeys.forEach(key =>{
      if(key !== `static-version${version}` && key.match('static-'))
        return caches.delete(key)
    })
  })

  e.waitUntil(cleanCaches)
})

let cleanMemeCache = (data) => {
  caches.open('memes').then(cache=>{
    cache.keys().then(keys=> {
      keys.forEach(key=> {
        if(!data.includes(key.url))
          cache.delete(key)
      })
    })
  })
}

//use cache as fallback
let nwFirstCache = (request) => {
  return fetch(request).then(fetchedRes=> {
    if(!fetchedRes.ok) throw 'server error'
    
    caches.open( `static-version${version}` )
      .then( cache => cache.put( request, fetchedRes ))

    return fetchedRes.clone()
  })
  .catch(err => {
    console.log(err)
    return caches.match(request)
  })
}

//access cache first
let staticCache = (request, cacheName=`static-version${version}`) => {
  return caches.match(request.url).then(res=> {
    if(res) return res

    return fetch(request).then(fetchedRes=> {
      caches.open(cacheName).then(cache => {
        cache.put(request, fetchedRes)
      })
      return fetchedRes.clone()
    })
  })
}

self.addEventListener('fetch', (e) => {
  if (e.request.url.match(location.origin))
    e.respondWith(staticCache(e.request))
  else if (e.request.url.match('/getMemes'))
    e.respondWith(nwFirstCache(e.request))
  else if (e.request.url.match('redd.it'))
    e.respondWith(staticCache(e.request, 'memes'))
})

self.addEventListener('message', (e)=> {
  if(e.data.action == 'cleanmemecache') cleanMemeCache(e.data.data)
})