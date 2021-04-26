#flask_mqtt对__init__.py有依赖,放在当前目录即可
from flask import Flask, render_template, url_for
from flask_mqtt import Mqtt

app = Flask(__name__)

'''#服务器的mqtt功能暂时阉割了
app.config['MQTT_BROKER_URL'] = '192.168.1.100'
app.config['MQTT_BROKER_PORT'] = 1883
app.config['MQTT_USERNAME'] = ''
app.config['MQTT_PASSWORD'] = ''
app.config['MQTT_KEEPALIVE'] = 10
app.config['MQTT_TLS_ENABLED'] = False

mqtt = Mqtt(app)

#app.run之后会自动建立连接
@mqtt.on_connect()
def handle_connect(client, userdata, flags, rc):
    mqtt.subscribe('flask-mqtt', 0)

@mqtt.on_message()
def handle_mqtt_message(client, userdata, message):
    print('Received message on topic {}:{}'
            .format(message.topic, message.payload.decode()))
    mqtt.publish('test', 'hello world')
    

@mqtt.on_log()
def handle_logging(client, userdata, level, buf):
    if level == MQTT_LOG_ERR:
        print('Error:{}'.format(buf))

'''
@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 5000, use_reloader = False, debug = False)

