import gpiozero
import time 
import Adafruit_DHT
from threading import Thread

oled_test_message = "Test Message."
#---mqtt----------------------------------------
import paho.mqtt.client as mqtt

def on_connect(mqttc, obj, flags, rc):
    if rc == 0:
        print("Connect success.")

def on_message(mqttc, obj, msg):
    print('Received message: ' + msg.topic + "-" + str(msg.qos) + "-" + str(msg.payload))

    #声明引用的是全局变量，函数中默认使用的都是局部变量
    global led 
    global oled_test_message 

    if 'get_data' in str(msg.payload):
        publish('led0', str(led))
        publish('oled', "From oled: " + oled_test_message)

    elif 'led0' in str(msg.payload):
        if led == 0:
            led0.on()
            led = 1
        else:
            led0.off()
            led = 0
        publish('led0', str(led))
    
    elif 'oled' in str(msg.payload):
        oled_show( str(msg.payload)[8:-1] )
        publish( 'oled', "From " + str(msg.payload)[2:-1] )

def on_publish(mqttc, obj, mid):
    print('publish完成，mid：' + str(mid))

def on_log(mqttc, obj, level, string):
    print('---log:' + string)

mqttc = mqtt.Client("Client")
mqttc.on_message = on_message
mqttc.on_connect = on_connect
#mqttc.on_publish = on_publish
#mqttc.on_subscribe = on_subscribe
#mqttc.on_log = on_log

mqttc.connect('192.168.1.100', 1883, 60)

#sub----作为client，订阅client，向client发布的消息我都会接受
mqttc.subscribe('client', 0)
mqttc.loop_start()


def publish(topic, msg):
    infot = mqttc.publish(topic, msg, qos = 0)
    #infot.wait_for_publish() 
#---mqtt----------------------------------------


#---button----------------------------------------
button = gpiozero.Button(24)
#---button----------------------------------------

#---led----------------------------------------
led0 = gpiozero.LED(18)
led = 0
set_time_start = '06-00-00'
set_time_end = '18-00-00'
led0.on()#开机提示，led闪烁2次
time.sleep(0.3)
led0.off()
time.sleep(0.3)
led0.on()
time.sleep(0.3)
led0.off()
time.sleep(0.3)

#能保持电平的，只要程序没有退出
now_time = time.strftime('%H-%M-%S')
if set_time_end >= now_time >= set_time_start:
    led0.off()
    led = 0
    print('led off')
else:
   led0.on()
   led = 1
   print('led on')
#---led----------------------------------------


#---dht11----------------------------------------
sensor = Adafruit_DHT.DHT11
gpio = 4
h = 0
t = 0
def get_dht11():
    global h,t 
    while True:
        #该函数有2s左右的延时
        h,t = Adafruit_DHT.read_retry(sensor, gpio)
        if h is None or t is None:
            print('dht11 error')
        
        publish('t', str(t))
        publish('h', str(h))
        time.sleep(4)

t1 = Thread(target=get_dht11)
t1.start()
#---dht11----------------------------------------

#---oled----------------------------------------
import subprocess
from board import SCL, SDA
import busio
from PIL import Image, ImageDraw, ImageFont
import adafruit_ssd1306

# Create the I2C interface.
i2c = busio.I2C(SCL, SDA)

# Create the SSD1306 OLED class.
# The first two parameters are the pixel width and pixel height.  Change these
# to the right size for your display!
disp = adafruit_ssd1306.SSD1306_I2C(128, 32, i2c)

# Clear display.
disp.fill(0)
disp.show()

# Create blank image for drawing.
# Make sure to create image with mode '1' for 1-bit color.
width = disp.width
height = disp.height
image = Image.new("1", (width, height))

# Get drawing object to draw on image.
draw = ImageDraw.Draw(image)

# Draw a black filled box to clear the image.
draw.rectangle((0, 0, width, height), outline=0, fill=0)

# Draw some shapes.
# First define some constants to allow easy resizing of shapes.
padding = -2
top = padding
bottom = height - padding
# Move left to right keeping track of the current x position for drawing shapes.
x = 0

# Load default font.
font = ImageFont.load_default()




def oled_show(message):
    #--oled
    # Draw a black filled box to clear the image.
    draw.rectangle((0, 0, width, height), outline=0, fill=0)

    # Write four lines of text.
    draw.text((x, top + 0), message, font=font, fill=255)
    #draw.text((x, top + 8), CPU, font=font, fill=255)
    #draw.text((x, top + 16), "Temperature", font=font, fill=255)
    #draw.text((x, top + 25), "Humidity", font=font, fill=255)

    # Display image.
    disp.image(image)
    disp.show()
    time.sleep(0.1)


#---oled----------------------------------------


#---main----------------------------------------
#初始化OLED
oled_show(oled_test_message)

while True:
    #--button
    if button.is_pressed:
        time.sleep(0.2)
        if button.is_pressed:
            print('button is pressed')
            publish('button', "1")#1号灯杆发出的紧急求救

#---main----------------------------------------
        



