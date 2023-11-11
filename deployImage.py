import os
import keyring
import requests

registry = 'docker.tinym.de'
appName = 'bombi'

credential = keyring.get_credential(registry, '')

session = requests.Session()
session.auth = (credential.username, credential.password)

response = session.get(f'https://{registry}/v2/{appName}/tags/list')

version = open('release-version.txt', 'r').read()

if version in response.json()['tags']:
    print('Version already exists!')
    quit()

os.chdir('./angular')
os.system('npm link @angular/cli')
os.system('ng build')
os.chdir('..')
os.system(f'docker login {registry}')
os.system(f'docker build -t {registry}/{appName} .')
os.system(f'docker tag {registry}/{appName} {registry}/{appName}:{version}')
os.system(f'docker push {registry}/{appName}')
os.system(f'docker push {registry}/{appName}:{version}')