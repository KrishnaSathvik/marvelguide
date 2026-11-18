import json,os,urllib.request,urllib.parse,time,sys
K=os.environ['K']; B='https://api.themoviedb.org/3'
def get(path,**q):
    q['api_key']=K
    return json.load(urllib.request.urlopen(f"{B}{path}?{urllib.parse.urlencode(q)}",timeout=20))
def find(kind,title,year=None):
    q={'query':title}
    if year: q['year' if kind=='movie' else 'first_air_date_year']=year
    r=get(f'/search/{kind}',**q)['results'] or get(f'/search/{kind}',query=title)['results']
    r.sort(key=lambda x:(-((x.get('title') or x.get('name','')).lower()==title.lower()),-x.get('popularity',0)))
    return r[0] if r else None
# key, kind, title, year, which(image), size
want=[
 # backdrops
 ('bd-iron-man','movie','Iron Man',2008,'b'),('bd-avengers','movie','The Avengers',2012,'b'),('bd-ultron','movie','Avengers: Age of Ultron',2015,'b'),
 ('bd-iw','movie','Avengers: Infinity War',2018,'b'),('bd-endgame','movie','Avengers: Endgame',2019,'b'),('bd-nwh','movie','Spider-Man: No Way Home',2021,'b'),
 ('bd-quant','movie','Ant-Man and the Wasp: Quantumania',2023,'b'),('bd-ff','movie','The Fantastic Four: First Steps',2025,'b'),('bd-thor','movie','Thor',2011,'b'),
 ('bd-cafa','movie','Captain America: The First Avenger',2011,'b'),('bd-dark-world','movie','Thor: The Dark World',2013,'b'),('bd-gotg','movie','Guardians of the Galaxy',2014,'b'),
 ('bd-doctor-strange','movie','Doctor Strange',2016,'b'),('bd-ant-man','movie','Ant-Man',2015,'b'),('bd-black-panther','movie','Black Panther',2018,'b'),
 ('bd-shang-chi','movie','Shang-Chi and the Legend of the Ten Rings',2021,'b'),('bd-ffh','movie','Spider-Man: Far From Home',2019,'b'),('bd-civil-war','movie','Captain America: Civil War',2016,'b'),
 ('bd-mom','movie','Doctor Strange in the Multiverse of Madness',2022,'b'),('bd-dw','movie','Deadpool & Wolverine',2024,'b'),('bd-thunderbolts','movie','Thunderbolts*',2025,'b'),
 ('bd-x2','movie','X2',2003,'b'),('bd-winter-soldier','movie','Captain America: The Winter Soldier',2014,'b'),('bd-ragnarok','movie','Thor: Ragnarok',2017,'b'),
 ('bd-wandavision','tv','WandaVision',2021,'b'),('bd-loki','tv','Loki',2021,'b'),('bd-what-if','tv','What If...?',2021,'b'),('bd-captain-marvel','movie','Captain Marvel',2019,'b'),
 ('bd-iron-man-2','movie','Iron Man 2',2010,'b'),('bd-bnw','movie','Captain America: Brave New World',2025,'b'),('bd-eternals','movie','Eternals',2021,'b'),
 # series posters
 ('series-loki-s1-2','tv','Loki',2021,'p'),('series-wandavision','tv','WandaVision',2021,'p'),('series-the-falcon-and-the-winter-soldier','tv','The Falcon and the Winter Soldier',2021,'p'),
 ('series-what-if','tv','What If...?',2021,'p'),('series-hawkeye','tv','Hawkeye',2021,'p'),('series-moon-knight','tv','Moon Knight',2022,'p'),('series-ms-marvel','tv','Ms. Marvel',2022,'p'),
 ('series-she-hulk-attorney-at-law','tv','She-Hulk: Attorney at Law',2022,'p'),('series-secret-invasion','tv','Secret Invasion',2023,'p'),('series-echo','tv','Echo',2024,'p'),
 ('series-agatha-all-along','tv','Agatha All Along',2024,'p'),('series-x-men-97','tv',"X-Men '97",2024,'p'),('series-daredevil-born-again','tv','Daredevil: Born Again',2025,'p'),
 ('series-your-friendly-neighborhood-spider-man','tv','Your Friendly Neighborhood Spider-Man',2025,'p'),('series-eyes-of-wakanda','tv','Eyes of Wakanda',2025,'p'),
 ('series-ironheart','tv','Ironheart',2025,'p'),('series-marvel-zombies','tv','Marvel Zombies',2025,'p'),('series-wonder-man','tv','Wonder Man',2026,'p'),('series-visionquest','tv','VisionQuest',2026,'p'),
 ('series-werewolf-by-night','movie','Werewolf by Night',2022,'p'),('series-the-guardians-of-the-galaxy-holiday-special','movie','The Guardians of the Galaxy Holiday Special',2022,'p'),
 ('series-the-punisher-one-last-kill','movie','The Punisher: One Last Kill',2026,'p'),
]
out={}; meta={}
for key,kind,title,year,which in want:
    try:
        r=find(kind,title,year)
        if not r: print('MISS',key); continue
        path=r.get('backdrop_path' if which=='b' else 'poster_path')
        if not path: print('NOIMG',key,r.get('title') or r.get('name')); continue
        sz='w780' if which=='b' else 'w342'
        fn=f"img/{sz}{path.replace('/','_')}"
        if not os.path.exists(fn): urllib.request.urlretrieve(f"https://image.tmdb.org/t/p/{sz}{path}",fn)
        out[key]=fn; meta[key]=(r.get('title') or r.get('name'), r.get('release_date') or r.get('first_air_date'))
    except Exception as e: print('ERR',key,e)
json.dump(out,open('enc_files.json','w'),indent=0); json.dump(meta,open('enc_meta.json','w'),indent=0)
print(len(out),'of',len(want))
for k,v in meta.items(): print(k,'->',v)
