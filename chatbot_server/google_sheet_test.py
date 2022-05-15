import pygsheets
import pandas as pd
#authorization
gc = pygsheets.authorize(service_file='chatbot-350307-ffe9b3e1c31a.json')

# Create empty dataframe
df = pd.DataFrame()

# Create a column
df['name'] = ['John', 'Steve', 'Sarah', 'Hog']

#open the google spreadsheet (where 'PY to Gsheet Test' is the name of my sheet)
sh = gc.open('test')

#select the first sheet 
wks = sh[0]

print(type(wks))
print(wks)

#update the first sheet with df, starting at cell B2. 
wks.set_dataframe(df,(1,1))