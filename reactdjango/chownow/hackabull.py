
#Uses populartimes Api and get's busy footprint on the longitude and latitude area
def populartimes(longitude, latitude):
    # Fancy PopularTimes Api call and should get an int between 0->100
    return 50

#Sets up class empty class for quiz results
class Results:
 def __init__(self):
    self.american = False
    self.asian = False
    self.italian = False
    self.hispanic = False
    self.indian = False
    self.preferWalk = False
    self.preferWait = False

#Creates class for empty place that will be filled in once the google maps and populartimes api is caleld
class Place:
    def __init__(self):
        self.name = ""
        self.rating = 0.0
        self.busyscale = 0
        self.picturelink = "" # Maybe if it isn't too hard
        self.description = "" # Haven't seen if it's possible
        self.directionmapslink = ""
        self.longitude = 0.0
        self.latitude = 0.0
        self.distance = 0
        self.goScore = 0.0


#PLACES STILL HAVE TO BE SORTED
def listofplaces(quizResults):
    # USE Google Maps API to develop a list of compatiable places using the keywords form the quiz
    currentlong = 4
    currentlat = 10
    # WE WILL FETCH 4 PLACES FOR NOW
    places = []

    # BASED ON WHAT THE USER SELECTED CYCLE THROUGH THE BOOL STATMENTS THAT THEY CHECKED AND MAKE CURRENTPLACE
    if quizResults.american == True:
        currentPlace = Place()
        currentPlace.latitude = 20 # FETCH FROM GOOGLE GEOMETRY
        currentPlace.longitude = 45 # FETCH FROM GOOGLE GEOMETRY
        currentPlace.description = "SARAH!!!!!!!!!!"
        currentPlace.name = "Jorge's Burger" # FETCH FROM PLACES API
        currentPlace.rating = 3.5 # FETCH FROM PLACES API
        currentPlace.busyscale = populartimes(currentPlace.longitude, currentPlace.latitude)
        # currentPlace.distance = (currentlong - currentPlace.longitude + currentlat - currentPlace.latitude)
        currentPlace.distance = 10 # FETCH RADIUS
        if quizResults.preferWalk == True:
            currentPlace.goScore = currentPlace.distance * 2 + currentPlace.busyscale
        else:
            currentPlace.goScore = currentPlace.busyscale * 2 + currentPlace.distance
        places.append(currentPlace)

    if quizResults.italian == True:
        currentPlace1 = Place()
        currentPlace1.latitude = 100 # FETCH FROM GOOGLE GEOMETRY
        currentPlace1.longitude = 50 # FETCH FROM GOOGLE GEOMETRY
        currentPlace1.description = "JAY!!!!!!!!!!"
        currentPlace1.name = "Gabriella's Cheese" # FETCH FROM PLACES API
        currentPlace1.rating = 4.5 # FETCH FROM PLACES API
        currentPlace1.busyscale = populartimes(currentPlace1.longitude, currentPlace1.latitude)
        # currentPlace.distance = (currentlong - currentPlace.longitude + currentlat - currentPlace.latitude)
        currentPlace1.distance = 5 # FETCH RADIUS
        if quizResults.preferWalk == True:
            currentPlace1.goScore = currentPlace1.distance * 2 + currentPlace1.busyscale
        else:
            currentPlace1.goScore = currentPlace1.busyscale * 2 + currentPlace1.distance
        places.append(currentPlace1)

    if quizResults.asian == True:
        currentPlace3 = Place()
        currentPlace3.latitude = 90 # FETCH FROM GOOGLE GEOMETRY
        currentPlace3.longitude = 12 # FETCH FROM GOOGLE GEOMETRY
        currentPlace3.description=  "YOAO CL!"
        currentPlace3.name = "Yao's Noodles" # FETCH FROM PLACES API
        currentPlace3.rating = 0.5 # FETCH FROM PLACES API
        currentPlace3.busyscale = populartimes(currentPlace3.longitude, currentPlace3.latitude)
        # currentPlace.distance = (currentlong - currentPlace.longitude + currentlat - currentPlace.latitude)
        currentPlace3.distance = 25 # FETCH RADIUS
        if quizResults.preferWalk == True:
            currentPlace3.goScore = currentPlace3.distance * 2 + currentPlace3.busyscale
        else:
            currentPlace3.goScore = currentPlace3.busyscale * 2 + currentPlace3.distance
        places.append(currentPlace3)

    if quizResults.hispanic == True:
        currentPlace4 = Place()
        currentPlace4.latitude = 90 # FETCH FROM GOOGLE GEOMETRY
        currentPlace4.longitude = 12 # FETCH FROM GOOGLE GEOMETRY
        currentPlace4.description=  "YOAO CL!"
        currentPlace4.name = "Yao's Noodles" # FETCH FROM PLACES API
        currentPlace4.rating = 0.5 # FETCH FROM PLACES API
        currentPlace4.busyscale = populartimes(currentPlace4.longitude, currentPlace4.latitude)
        # currentPlace.distance = (currentlong - currentPlace.longitude + currentlat - currentPlace.latitude)
        currentPlace4.distance = 25 # FETCH RADIUS
        if quizResults.preferWalk == True:
            currentPlace4.goScore = currentPlace4.distance * 2 + currentPlace4.busyscale
        else:
            currentPlace4.goScore = currentPlace4.busyscale * 2 + currentPlace4.distance
        places.append(currentPlace4)
    
    if quizResults.indian == True:
        currentPlace5 = Place()
        currentPlace5.latitude = 90 # FETCH FROM GOOGLE GEOMETRY
        currentPlace5.longitude = 12 # FETCH FROM GOOGLE GEOMETRY
        currentPlace5.description=  "YOAO CL!"
        currentPlace5.name = "Yao's Noodles" # FETCH FROM PLACES API
        currentPlace5.rating = 0.5 # FETCH FROM PLACES API
        currentPlace5.busyscale = populartimes(currentPlace5.longitude, currentPlace5.latitude)
        # currentPlace.distance = (currentlong - currentPlace.longitude + currentlat - currentPlace.latitude)
        currentPlace5.distance = 25 # FETCH RADIUS
        if quizResults.preferWalk == True:
            currentPlace5.goScore = currentPlace5.distance * 2 + currentPlace5.busyscale
        else:
            currentPlace5.goScore = currentPlace5.busyscale * 2 + currentPlace5.distance
        places.append(currentPlace5)

    return places;

#Testing
results = Results()
results.american = True
places = listofplaces(results)
print(places[0].longitude)
