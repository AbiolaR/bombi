import os

os.chdir('./angular')
os.system('npm link @angular/cli')
os.system('ng build')
os.chdir('..')
os.system('docker login docker.tinym.de')
os.system('docker build . -t docker.tinym.de/bombi')
os.system('docker push docker.tinym.de/bombi')