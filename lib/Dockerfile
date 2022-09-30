FROM public.ecr.aws/sam/build-python3.9

COPY lambda-processor/requirements.txt .
RUN pip install -r requirements.txt -t ./lambda-processor-layer/python/lib/python3.9/site-packages
