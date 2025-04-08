import json
from datetime import datetime
from collections import defaultdict
"""
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
def parse_captions(ass_file):
    if ass_file.split('.')[-1] != 'ass':
        print("NO")
        return
    
    with open(ass_file, 'r', encoding = 'utf-8-sig') as file:
        lines = file.readlines()

    events =[]
    events_Section = False
    for line in lines:
        if line.strip() == '[Events]':
            events_Section = True
            continue #the next lines are the events
        if events_Section and line.strip().startswith("Dialogue"):
            #PARSE THE DIALOGUE
            parts = line.split(',', 9)
            if len(parts)<10:
                continue

            # unpack and parse
            parts = [p.strip() for p in parts]
            layer, start,end,style,name,marginL,marginR, marginV, effect,caption = parts
            start_time = datetime.strptime(start, "%H:%M:%S.%f")
            end_time = datetime.strptime(end, "%H:%M:%S.%f")
            start_seconds = start_time.hour *60*60 + start_time.minute * 60 + start_time.second
            end_seconds = end_time.hour *60*60 + end_time.minute * 60 + end_time.second
            events.append({
                # 'start_time':start_time,
                'global_start_seconds': start_seconds,
                # 'end_time':end_time,
                'global_end_seconds':end_seconds,
                'caption': caption,
                'name':name,
                'effect':effect,
                'style':style
            })
    return events

# """
# group them by bin size
# bin size is in seconds
# """
# def bin_captions(events, bin_size = 10):
#     bins = {}
#     for event in events:
#         start_seconds = event['start_seconds']
#         end_seconds = event['end_seconds']

#         start_bin = (start_seconds//bin_size)*bin_size #round it to the nearest bin seconds multiple
#         end_bin = (end_seconds//bin_size)*bin_size

#         for bin_time in range(start_bin, end_bin + bin_size, bin_size):
#             if bin_time not in bins:
#                 bins[bin_time] = []
#             bins[bin_time].append(event)

#     return bins

def group_captions(events, bin_size):
    bins = defaultdict(list)
    max_end_time = max(event['global_end_seconds'] for event in events)
    for event in events:
        # if it starts in the bin then ya i want it
        bin_index = int(event['global_start_seconds'] // bin_size)
        event['start_seconds'] = event['global_start_seconds']-bin_size*bin_index
        event['end_seconds'] =event['start_seconds']+ event['global_end_seconds']-event['global_start_seconds']
        bins[bin_index].append(event)
    sorted_bins = [bins[i] for i in range(int(max_end_time // bin_size) + 1)]
    return sorted_bins


def getCaptionData(name, bin_size = 100):
    events =parse_captions(f"./tmp/{name}/captions.ass")
    bins = group_captions(events,bin_size = bin_size)

    with open(f"./tmp/{name}/captions.json", 'w', encoding='utf-8') as json_file:
        json.dump(bins, json_file, indent=4)

getCaptionData("princessSmall", 80.0379506)