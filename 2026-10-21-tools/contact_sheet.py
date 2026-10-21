import sys
from PIL import Image, ImageDraw
files = sys.argv[2:]; out = sys.argv[1]
w, h = 640, 360; cols = 2; rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (w * cols, h * rows), 'black'); d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h)); x, y = (i % cols) * w, (i // cols) * h
    sheet.paste(im, (x, y)); d.text((x + 8, y + 8), f.split('/')[-1], fill='yellow')
sheet.save(out, quality=90); print(out, sheet.size)
