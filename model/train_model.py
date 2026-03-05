import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

# 1. Constants
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 25
NUM_CLASSES = 10 # Example: adjust based on your dataset

def build_model(num_classes):
    # Load MobileNetV2 pretrained on ImageNet
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Freeze base layers initially
    base_model.trainable = False
    
    # Add custom classification head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.5)(x)
    output = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=output)
    
    # Compile
    model.compile(optimizer=Adam(learning_rate=0.001),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    return model

def train():
    # 2. Data Preprocessing & Augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        zoom_range=0.2,
        brightness_range=[0.8, 1.2],
        validation_split=0.3 # 70% train, 30% for val/test split
    )

    # 3. Load Dataset (Assuming dataset folder exists)
    # train_generator = train_datagen.flow_from_directory(
    #     'dataset/',
    #     target_size=IMG_SIZE,
    #     batch_size=BATCH_SIZE,
    #     class_mode='categorical',
    #     subset='training'
    # )

    # val_generator = train_datagen.flow_from_directory(
    #     'dataset/',
    #     target_size=IMG_SIZE,
    #     batch_size=BATCH_SIZE,
    #     class_mode='categorical',
    #     subset='validation'
    # )

    model = build_model(NUM_CLASSES)

    # 4. Callbacks
    early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=0.00001)

    # 5. Training
    # history = model.fit(
    #     train_generator,
    #     epochs=EPOCHS,
    #     validation_data=val_generator,
    #     callbacks=[early_stop, reduce_lr]
    # )

    # 6. Save Model
    model.save('model.h5')
    print("Model saved as model.h5")

if __name__ == "__main__":
    print("Starting training script...")
    # train() # Uncomment to run training
