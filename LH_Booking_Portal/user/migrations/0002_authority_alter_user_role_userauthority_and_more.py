# Generated by Django 5.1.5 on 2025-03-22 09:21

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Authority',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
            ],
        ),
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(choices=[('admin', 'Admin'), ('faculty', 'Faculty'), ('student', 'Student')], default='student', max_length=10),
        ),
        migrations.CreateModel(
            name='UserAuthority',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.PositiveIntegerField(default=0)),
                ('authority', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='user.authority')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['order'],
                'unique_together': {('user', 'authority')},
            },
        ),
        migrations.AddField(
            model_name='user',
            name='authorities',
            field=models.ManyToManyField(blank=True, through='user.UserAuthority', to='user.authority'),
        ),
    ]
