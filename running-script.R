source("~/russia-clust/code/R/tripadvisor-methods.R")

cityIds = c(298536, 298484, 298520, 298540, 298529, 298500, 298532, 1380981, 608960, 298515, 298525, 298521, 298535, 298516, 298530, 
            298527, 298539, 298496, 298518, 662362, 1956128, 798121, 298537, 798124)

#Getting hotel links
links = lapply(setNames(cityIds, cityIds), function(cityId){ #setNames is used to have named list; see http://stackoverflow.com/a/18520422/3818255
  getTotalOffset(cityId) %>% 
    getOffsetLinks(cityId) %>% 
    lapply(function(url) getHotelLinksByPage(url, cityId)) %>%
    unlist()
})

#how many hotels we fetched
sapply(links, length) %>% sum

#1.
start <- Sys.time()
links.reviews <- lapply(links, function(city) {
  lapply(city, function(link) {
    getTotalOffsetByUrl(link, is.hotel = T) %>%
            getOffsetLinksByUrl(link, is.hotel = T)
  })
})
Sys.time() - start #for debug

#14952 pages to crawl! ~15 hours
sapply(links.reviews, function(x) {sapply(x, length)}) %>% unlist %>% sum

#2.
index = 1;
lapply(links.reviews, function(x) {
  id <- names(links.reviews)[index]
  x %>%
    unlist %>%
    toJSON() %>% 
    write(paste0("data/review-links-", id, ".json"))
  
  index <<- index + 1
})

#jesus

moscow <- links.reviews[[2]] %>% unlist
moscow.seq <- seq(1, length(moscow), 200)
for (i in 1:length(moscow.seq)) {
  write(toJSON(moscow[moscow.seq[i]:moscow.seq[i+1]]), paste0("data/links-by-city/review-links-moscow-part", i, ".json"))
}

#roadmap for following work:
#1. Generate a list of all hotel review links with needed offsets of the look city[hotel[review-link-1, review-link-2, ...]]
#2. Store it into a JSON, for each city, so that Casper script doesn't have to iterate over a bunch of objects, which is just silly
#because we don't really care for the hotels, so the model city - links is just fine
#3. Run the Casper script with node so that it
# 3.1 Loads JSON
# 3.2 Opens each link
# 3.3 Gets the reviews and reviewer origin and creates an object of the look {origin: review}
# 3.4 If the origin lacks, ditches those elements
# 3.5 Forms object of reviews so that it looks like {city: {origin: review}}
# 3.6 Writes it into a JSON
#4. Load JSON of reviews

#Work on data test on Kirov
kirov.df <- data.frame(location = unlist(fromJSON("data/output-1380981.json")$location), review = unlist(fromJSON("data/output-1380981.json")$reviews), stringsAsFactors = FALSE)
kirov.df <- cbind(kirov.df, geocode(kirov.df$location, source = "dsk"))
