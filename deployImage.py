import os
import keyring
import requests

def getNewVersion(file):
    print('Please enter new version:')
    version = input()
    file.seek(0)
    file.write(version)
    file.truncate()
    return checkVersion(version, file)


def checkVersion(version, file):
    if not version:
        print('Version can not be empty')
        version = getNewVersion(file)
    if version in response.json()['tags']:
        print(f'Version {version} already exists!')
        version = getNewVersion(file)
    return version

def checkCredential(credential):
    if not credential:
        print('Invalid username!')
        print('Please enter the username to connect to the docker registry:')
        username = input()
        credential = keyring.get_credential(registry, username)
        return checkCredential(credential)
    return credential

registry = 'docker.tinym.de'
appName = 'bombi'

credential = keyring.get_credential(registry, '')
credential = checkCredential(credential)

session = requests.Session()
session.auth = (credential.username, credential.password)

response = session.get(f'https://{registry}/v2/{appName}/tags/list')

versionFile = open('release-version.txt', 'r+')
version = versionFile.read()
version = checkVersion(version, versionFile)

versionFile.close()

os.chdir('./angular')
os.system('npm link @angular/cli')
os.system('ng build')
os.chdir('..')
os.system(f'docker login {registry}')
os.system(f'docker build --platform linux/amd64 -t {registry}/{appName} .')
os.system(f'docker tag {registry}/{appName} {registry}/{appName}:{version}')
os.system(f'docker push {registry}/{appName}')
os.system(f'docker push {registry}/{appName}:{version}')