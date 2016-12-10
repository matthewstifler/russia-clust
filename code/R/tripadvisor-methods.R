require(rvest)
require(dplyr)
require(functional)
require(dplyr)
require(rvest)

#---------------------COMMON METHODS---------------------

getNodesAttribute <- function(url, xpath, attribute) { #replaced for reusability
  url %>%
    read_html() %>%
    html_nodes(xpath = xpath) %>%
    html_attr(attribute) %>%
    return()
}

getTotalOffset <- function(cityId, hotelId) {
  if (missing (hotelId)) {
    #We check last pagination number on the page for "data-offset" property
    offset <- urlConstructor(cityId = cityId) %>%
      getNodesAttribute(xpath = "//*[@class = 'pageNum last taLnk']", attribute = "data-offset") %>%
      as.numeric()
    
    #If there is no pagination, which is possible, return 30
    return(
      ifelse(length(offset) > 0, offset, 30)
    )
  } else {
    offset <- urlConstructor(cityId, hotelId) %>%
      getNodesAttribute(xpath = "(//*[@class = 'pageNumbers']//a)[last()]", attribute = "data-offset") %>%
      as.numeric()
    
    return(
      ifelse(length(offset) > 0, offset, 10)
    )
  }
}

#TODO: Optimize nested ifs (see open Chrome tabs)
urlConstructor <- function(cityId, hotelId = NULL, offset) {
  if (is.null(hotelId)) {
    if (missing(offset)) {
      return(paste0("https://tripadvisor.ru/Hotels-g", cityId))
    } else {
      return(paste0("https://tripadvisor.ru/Hotels-g", cityId, "-oa", as.character(offset)))
    }
  } else {
    if (missing(offset)) {
      return(paste0("http://tripadvisor.ru/Hotel_Review-g", cityId, "-d", hotelId))
    } else {
      return (paste0("http://tripadvisor.ru/Hotel_Review-g", cityId, "-d", hotelId, "-or", offset))
    }
  }
}

getOffsetLinks <- function(offset, cityId, hotelId = NULL) {
  step = ifelse(is.null(hotelId), 30, 10)
  
  seq(0, offset, step) %>%
    #Afterwards we combine the vector of offsets into final urls
    sapply(function(x) {
      urlConstructor(cityId = cityId, hotelId = hotelId, offset = x)
    })
}

#---------------------HOTEL METHODS---------------------

getHotelLinksByPage <- function(url, cityId) {
  getNodesAttribute(url, xpath = "//*[@class='listing easyClear  p13n_imperfect ']", attribute = "data-locationid") %>%
    sapply(function(hotelId) urlConstructor(cityId = cityId, hotelId = hotelId))
}

#TODO: think of a function wrapper for final call (see running-script)

#---------------------REVIEW METHODS---------------------

