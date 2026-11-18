import json, os, sys, time, urllib.request, urllib.parse
K=os.environ['K']; B='https://api.themoviedb.org/3'
def get(path, **q):
    q['api_key']=K; u=f"{B}{path}?{urllib.parse.urlencode(q)}"
    for _ in range(3):
        try: return json.load(urllib.request.urlopen(u, timeout=20))
        except Exception as e: err=e; time.sleep(1)
    raise err
def search(kind, title, year=None):
    q={'query':title}
    if year and isinstance(year,int): q['year' if kind=='movie' else 'first_air_date_year']=year
    r=get(f'/search/{kind}',**q)['results']
    if not r and year: r=get(f'/search/{kind}',query=title)['results']
    # prefer Marvel-ish exact title
    r.sort(key=lambda x:(-( (x.get('title') or x.get('name','')).lower()==title.lower()), -x.get('popularity',0)))
    return r[0] if r else None
def detail(kind, id_):
    d=get(f'/{kind}/{id_}', append_to_response='credits' if kind=='movie' else 'aggregate_credits')
    cr=d.get('credits') or d.get('aggregate_credits') or {}
    cast=[c['name'] for c in cr.get('cast',[])[:4]]
    return {'tmdb':id_,'kind':kind,'title':d.get('title') or d.get('name'),'date':d.get('release_date') or d.get('first_air_date'),
            'runtime':d.get('runtime'),'poster':d.get('poster_path'),'backdrop':d.get('backdrop_path'),'cast':cast,'vote':d.get('vote_average')}
items=json.load(open(sys.argv[1])); out={}
for key,kind,title,year in items:
    try:
        s=search(kind,title,year)
        if not s: print('MISS',key,title); continue
        out[key]=detail(kind,s['id']); print('ok',key,'->',out[key]['title'],out[key]['date'],out[key]['cast'][:2])
    except Exception as e: print('ERR',key,e)
json.dump(out,open(sys.argv[2],'w'),indent=1)
