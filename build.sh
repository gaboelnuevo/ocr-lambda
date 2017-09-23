BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILD_DIR=$BASE_DIR/build

sudo yum install libtool
sudo yum install libjpeg-devel libpng-devel libtiff-devel zlib-devel


curl http://www.leptonica.com/source/leptonica-1.73.tar.gz | tar xzv
cd leptonica-1.73 && ./configure && make && sudo make install && cd ..

curl -L https://github.com/tesseract-ocr/tesseract/archive/3.04.01.tar.gz | tar xzv
cd tesseract-3.04.01/

export LIBLEPT_HEADERSDIR=$BASE_DIR/leptonica-1.73/src
./autogen.sh && ./configure --with-extra-libraries=$BASE_DIR/leptonica-1.73/src/.libs && make && sudo make install && cd ..

cd  $BASE_DIR
mkdir build
cd build
mkdir lib-linux_x64
mkdir bin-linux_x64

mkdir lib-linux_x64/tesseract
echo "Making a copy of libs"

cp /usr/local/lib/{libtesseract.so.3,liblept.so.5} lib-linux_x64/tesseract/
cp /lib64/{librt.so.1,libz.so.1,libpthread.so.0,libm.so.6,libgcc_s.so.1,libc.so.6,ld-linux-x86-64.so.2} lib-linux_x64/tesseract/
cp /usr/lib64/{libpng12.so.0,libjpeg.so.62,libtiff.so.5,libstdc++.so.6,libjbig.so.2.0} lib-linux_x64/tesseract/
cp /usr/local/share/tessdata/* lib-linux_x64/tesseract/tessdata
cp /usr/local/bin/tesseract bin-linux_x64/

mkdir lib-linux_x64/tesseract/tessdata
cd  $BASE_DIR
#curl -L https://github.com/tesseract-ocr/tessdata/archive/3.04.00.tar.gz | tar xzv
#cp tessdata-3.04.00/eng.* build/lib-linux_x64/tesseract/tessdata/
